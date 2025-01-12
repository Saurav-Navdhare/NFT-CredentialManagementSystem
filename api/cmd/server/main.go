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
	initializers.InitDB()
}

func main() {

	r := gin.Default()

	api.SetupRoutes(r)

	err := r.Run()
	if err != nil {
		log.Fatalf(err.Error())
	}
}
