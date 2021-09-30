package commands

import (
	"fmt"

	"github.com/caleeli/phantom/backend/repository"
	"github.com/caleeli/phantom/backend/storage"
	"github.com/spf13/cobra"
)

type Request struct {
	Resource string            `json:"resource"`
	Filters  map[string]string `json:"filters"`
}

type Response struct {
	Data interface{} `json:"data"`
}

// indexCmd initialize Index command
func indexCmd() *cobra.Command {
	command := &cobra.Command{
		Use:   "index [resource]",
		Short: "Index the resource",
		Run:   index(),
		Args:  cobra.MinimumNArgs(1),
	}
	return command
}

func index() CobraFn {
	return func(cmd *cobra.Command, args []string) {
		resource := args[0]
		filter := map[string]string{}
		tasks := storage.GetResourceCollection(resource)
		err := repository.Index(resource, filter, tasks)
		if err != nil {
			panic(err)
		}
		fmt.Println(tasks)
	}
}
