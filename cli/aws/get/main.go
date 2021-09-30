package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/caleeli/phantom/backend/repository"
	"github.com/caleeli/phantom/backend/storage"
)

type Request struct {
	Resource string `json:"resource"`
	Id       string `json:"id"`
}

type Response struct {
	Data interface{} `json:"data"`
}

func main() {
	lambda.Start(Handler)
}

func Handler(event Request) (response Response, err error) {
	task := storage.GetResource(event.Resource)
	err = repository.Get(event.Resource, event.Id, task)
	response.Data = task
	return
}
