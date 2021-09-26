package main

import (
	"fmt"

	"github.com/caleeli/phantom/backend/repository"
)

type Task struct {
	Id   interface{} `bson:"_id" json:"id,omitempty"`
	Name string      `bson:"Name"`
}

type Tasks = []Task

func main() {
	fmt.Println("Hello, World!")
	task := Task{}
	tasks := Tasks{}
	var err error

	// Create a new task
	id := repository.GenerateID()
	err = repository.Post("tasks", &Task{Id: id, Name: "uno"})
	if err != nil {
		fmt.Println(err)
	}

	// Get list of tasks
	filter := map[string]string{}
	filter["Name"] = "uno"
	err = repository.Index("tasks", filter, &tasks)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(tasks)

	// Get a single task by id
	err = repository.Get("tasks", tasks[0].Id, &task)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(task)

	// Update a task
	err = repository.Put("tasks", tasks[0].Id, &task)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Task updated: ", tasks[0].Id)

	// Delete task
	err = repository.Delete("tasks", tasks[0].Id)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Task deleted: ", tasks[0].Id)

}
