package dynamodb

import (
	"context"
	"os"
	"reflect"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/caleeli/phantom/backend/storage"
	"github.com/google/uuid"
	"github.com/pkg/errors"
)

type tConnection struct {
	svc *dynamodb.Client
	ctx *context.Context
}

type tTable struct {
	db        *tConnection
	TableName *string
}

func (db *tConnection) ResolveEndpoint(service, region string) (aws.Endpoint, error) {
	return aws.Endpoint{
		URL: os.Getenv("AWS_ENDPOINT_URL"),
	}, nil
}

func Connect() (storage.Repository, error) {
	service := &tConnection{}
	endpoint := os.Getenv("AWS_ENDPOINT_URL")

	ctx := context.TODO()
	cfg, err := config.LoadDefaultConfig(ctx)
	if endpoint != "" {
		cfg, err = config.LoadDefaultConfig(ctx, config.WithEndpointResolver(service))
	}
	if err != nil {
		return nil, struct{ error }{errors.Wrapf(err, "Unable to init Dynamo config")}
	}
	svc := dynamodb.NewFromConfig(cfg)
	service.svc = svc
	service.ctx = &ctx
	return service, nil
}

func (connection *tConnection) GetResource(tableName string) (storage.Resource, error) {
	return &tTable{
		db:        connection,
		TableName: aws.String(tableName),
	}, nil
}

func ConvertToID(uuid string) interface{} {
	return uuid
}

func GenerateID() interface{} {
	return ConvertToID(uuid.New().String())
}

func (table *tTable) Get(key interface{}, out interface{}) error {
	keyMap, err := attributevalue.MarshalMap(struct {
		Id string
	}{
		Id: key.(string),
	})
	if err != nil {
		return err
	}
	input := &dynamodb.GetItemInput{
		Key:       keyMap,
		TableName: table.TableName,
	}
	output, err := table.db.svc.GetItem(*table.db.ctx, input)
	if err != nil {
		return err
	}
	err = attributevalue.UnmarshalMap(output.Item, out)
	if err != nil {
		return err
	}
	return nil
}

func (table *tTable) Index(filter map[string]string, out interface{}) error {
	input := &dynamodb.ScanInput{
		TableName: table.TableName,
	}
	if len(filter) > 0 {
		builder := expression.NewBuilder()
		for key, value := range filter {
			builder = builder.WithFilter(expression.Name(key).Equal(expression.Value(value)))
		}
		expr, err := builder.Build()
		if err != nil {
			return err
		}
		input.ExpressionAttributeNames = expr.Names()
		input.ExpressionAttributeValues = expr.Values()
		input.FilterExpression = expr.Filter()
	}
	output, err := table.db.svc.Scan(*table.db.ctx, input)
	if err != nil {
		return err
	}
	resultsVal := reflect.ValueOf(out)
	sliceVal := resultsVal.Elem()
	elementType := sliceVal.Type().Elem()
	for index, item := range output.Items {
		newElem := reflect.New(elementType)
		sliceVal = reflect.Append(sliceVal, newElem.Elem())
		currElem := sliceVal.Index(index).Addr().Interface()
		err = attributevalue.UnmarshalMap(item, currElem)
		if err != nil {
			return err
		}
	}
	resultsVal.Elem().Set(sliceVal)
	return nil
}

func (table *tTable) Post(record interface{}) error {
	item, err := attributevalue.MarshalMap(record)
	if err != nil {
		return err
	}
	input := &dynamodb.PutItemInput{
		Item:      item,
		TableName: table.TableName,
	}
	_, err = table.db.svc.PutItem(*table.db.ctx, input)
	return err
}

func (table *tTable) Put(key interface{}, record interface{}) error {
	keyMap, err := attributevalue.MarshalMap(struct {
		Id string
	}{
		Id: key.(string),
	})
	if err != nil {
		return err
	}
	input := &dynamodb.UpdateItemInput{
		Key:       keyMap,
		TableName: table.TableName,
	}
	builder := expression.NewBuilder()
	v := reflect.Indirect(reflect.ValueOf(record))
	typeOfS := v.Type()
	for i := 0; i < v.NumField(); i++ {
		key := typeOfS.Field(i).Name
		value := v.Field(i).Interface()
		builder = builder.WithUpdate(expression.Set(expression.Name(key), expression.Value(value)))
	}
	expr, err := builder.Build()
	if err != nil {
		return err
	}
	input.ExpressionAttributeNames = expr.Names()
	input.ExpressionAttributeValues = expr.Values()
	input.UpdateExpression = expr.Update()
	_, err = table.db.svc.UpdateItem(*table.db.ctx, input)
	if err != nil {
		return err
	}
	return nil
}

func (table *tTable) Delete(key interface{}) error {
	keyMap, err := attributevalue.MarshalMap(struct {
		Id string
	}{
		Id: key.(string),
	})
	if err != nil {
		return err
	}
	input := &dynamodb.DeleteItemInput{
		Key:       keyMap,
		TableName: table.TableName,
	}
	_, err = table.db.svc.DeleteItem(*table.db.ctx, input)
	if err != nil {
		return err
	}
	return nil
}
