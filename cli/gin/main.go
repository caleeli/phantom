package main

import (
	"net/http"

	"github.com/caleeli/phantom/backend/repository"
	"github.com/caleeli/phantom/backend/storage"
	"github.com/gin-gonic/gin"
)

type IndexUri struct {
	Name string `uri:"name" binding:"required"`
	// Optional filer from query string filter={"name":"value"}
	Filter map[string]string `uri:"filter"`
}

func main() {
	router := gin.Default()
	router.GET("/api/:name", indexResource)
	router.Run("localhost:5050")
}

// indexResource responds with the list of items in Resource
func indexResource(c *gin.Context) {
	var uri IndexUri
	if err := c.ShouldBindUri(&uri); err != nil {
		c.JSON(400, gin.H{"msg": err})
		return
	}
	filter := map[string]string{}
	tasks := storage.GetResourceCollection(uri.Name)
	err := repository.Index(uri.Name, filter, tasks)
	if err != nil {
		panic(err)
	}
	c.IndentedJSON(http.StatusOK, tasks)
}
