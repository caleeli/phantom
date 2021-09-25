package main

import (
	"fmt"

	"github.com/caleeli/phantom/backend/repository"
)

type Task struct {
	ID   string `bson:"_id" json:"id,omitempty"`
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

	err = repository.Get("tasks", tasks[0].ID, &task)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(task)
}
