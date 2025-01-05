package main

import (
	"api/internal/api"
	"api/internal/initializers"
	"github.com/gin-gonic/gin"
	"log"
)

func init() {
	initializers.LoadENV()
	initializers.InitRedis()
}

func main() {

	r := gin.Default()

	api.SetupRoutes(r)

	err := r.Run(":8080")
	if err != nil {
		log.Fatalf(err.Error())
	}
}
