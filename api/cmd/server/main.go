package main

import (
	"api/internal/api"
	"api/internal/initializers"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVars()

	initializers.InitRedis()
	initializers.InitDB()
}

func main() {

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to the NFT Credential Management System API",
		})
	})

	api.SetupRoutes(r)

	err := r.Run()
	if err != nil {
		log.Fatalf(err.Error())
	}
}
