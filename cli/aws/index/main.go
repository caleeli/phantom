package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/caleeli/phantom/backend/repository"
	"github.com/caleeli/phantom/backend/storage"
)

type Request struct {
	Resource string            `json:"resource"`
	Filters  map[string]string `json:"filters"`
}

type Response struct {
	Data interface{} `json:"data"`
}

func main() {
	lambda.Start(Handler)
}

func Handler(event Request) (response Response, err error) {
	filter := event.Filters
	tasks := storage.GetResourceCollection(event.Resource)
	err = repository.Index(event.Resource, filter, tasks)
	response.Data = tasks
	return
}
