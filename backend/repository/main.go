package repository

import (
	"github.com/caleeli/phantom/backend/dynamodb"
	"github.com/caleeli/phantom/backend/mongodb"
	"github.com/caleeli/phantom/backend/storage"
)

const repositoryDriver = "mongodb"

func connect() (repository storage.Repository, err error) {
	if repositoryDriver == "dynamodb" {
		repository, err = dynamodb.Connect()
	} else if repositoryDriver == "mongodb" {
		repository, err = mongodb.Connect()
	}
	if err != nil {
		return nil, err
	}
	return
}
func Get(name string, id string, out interface{}) error {
	repository, err := connect()
	if err != nil {
		return err
	}
	resource, err := repository.GetResource(name)
	if err != nil {
		return err
	}
	return resource.Get(id, out)
}

func Index(name string, filter map[string]string, out interface{}) error {
	repository, err := connect()
	if err != nil {
		return err
	}
	resource, err := repository.GetResource(name)
	if err != nil {
		return err
	}
	return resource.Index(filter, out)
}
