package mongodb

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/caleeli/phantom/backend/storage"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type tConnection struct {
	client   *mongo.Client
	database *mongo.Database
	ctx      context.Context
}

type tTable struct {
	db        *tConnection
	TableName *string
}

func Connect() (storage.Repository, error) {
	DB_HOST := "127.0.0.1"
	DB_PORT := "27017"
	DB_NAME := "phantom"
	uri := fmt.Sprintf(
		"mongodb://%s:%s",
		DB_HOST,
		DB_PORT,
	)
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, struct{ error }{errors.Wrapf(err, "Unable to config MongoDB connection")}
	}
	ctx := context.TODO()
	err = client.Connect(ctx)
	if err != nil {
		return nil, struct{ error }{errors.Wrapf(err, "Unable to connect to MongoDB Service")}
	}
	service := &tConnection{
		client:   client,
		database: client.Database(DB_NAME),
		ctx:      ctx,
	}
	return service, nil
}

func (connection *tConnection) GetResource(tableName string) (storage.Resource, error) {
	return &tTable{
		db:        connection,
		TableName: aws.String(tableName),
	}, nil
}

func (table *tTable) Get(key string, out interface{}) error {
	collection := table.db.database.Collection(*table.TableName)
	id, err := primitive.ObjectIDFromHex(key)
	if err != nil {
		return err
	}
	filter := bson.D{{Key: "_id", Value: id}}
	err = collection.FindOne(table.db.ctx, filter).Decode(out)
	if err != nil {
		return err
	}
	return nil
}

func (table *tTable) Index(filter map[string]string, out interface{}) error {
	collection := table.db.database.Collection(*table.TableName)
	filter1 := bson.D{}
	if len(filter) > 0 {
		for key, value := range filter {
			filter1 = append(filter1, bson.E{Key: key, Value: value})
		}
	}
	cursor, err := collection.Find(table.db.ctx, filter1)
	cursor.All(table.db.ctx, out)
	if err != nil {
		return err
	}
	return nil
}

func (table *tTable) Post(record interface{}) error {
	collection := table.db.database.Collection(*table.TableName)
	_, err := collection.InsertOne(table.db.ctx, record)
	if err != nil {
		return err
	}
	return nil
}
