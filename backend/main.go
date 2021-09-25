package main

import (
	"fmt"

	"github.com/caleeli/phantom/backend/repository"
	"github.com/google/uuid"
)

type Task struct {
	Id   string `bson:"_id" json:"id,omitempty"`
	Name string
}

type Tasks = []Task

func main() {
	fmt.Println("Hello, World!")
	task := Task{}
	tasks := Tasks{}

	filter := map[string]string{}
	filter["Name"] = "uno"
	err := repository.Index("tasks", filter, &tasks)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(tasks)

	err = repository.Get("tasks", tasks[0].Id, &task)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(task)

	id := uuid.New().String()
	err = repository.Post("tasks", &Task{Id: id, Name: "uno"})
	if err != nil {
		fmt.Println(err)
	}
}
