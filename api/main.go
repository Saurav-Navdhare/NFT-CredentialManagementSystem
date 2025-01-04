package main

import (
	"api/initializers"
	"api/routes"
	"github.com/gin-gonic/gin"
	"log"
)

func init() {
	initializers.LoadENV()
	initializers.InitRedis()
}

func main() {

	r := gin.Default()

	routes.SetupRoutes(r)

	err := r.Run(":8080")
	if err != nil {
		log.Fatalf(err.Error())
	}
}
