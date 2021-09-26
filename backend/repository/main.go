package repository

import (
	"github.com/caleeli/phantom/backend/dynamodb"
	"github.com/caleeli/phantom/backend/mongodb"
	"github.com/caleeli/phantom/backend/storage"
)

const repositoryDriver = "dynamodb"

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

func GenerateID() interface{} {
	if repositoryDriver == "dynamodb" {
		return dynamodb.GenerateID()
	} else if repositoryDriver == "mongodb" {
		return mongodb.GenerateID()
	}
	return ""
}

func Get(name string, id interface{}, out interface{}) error {
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

func Post(name string, record interface{}) error {
	repository, err := connect()
	if err != nil {
		return err
	}
	resource, err := repository.GetResource(name)
	if err != nil {
		return err
	}
	return resource.Post(record)
}

func Put(name string, id interface{}, record interface{}) error {
	repository, err := connect()
	if err != nil {
		return err
	}
	resource, err := repository.GetResource(name)
	if err != nil {
		return err
	}
	return resource.Put(id, record)
}

func Delete(name string, id interface{}) error {
	repository, err := connect()
	if err != nil {
		return err
	}
	resource, err := repository.GetResource(name)
	if err != nil {
		return err
	}
	return resource.Delete(id)
}
