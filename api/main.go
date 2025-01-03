package main

import (
	"api/initializers"
	"api/routes"
	"github.com/gin-gonic/gin"
	"log"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.InitDB()
	initializers.InitRedis()
}

func main() {
	r := gin.Default()

	// Register routes
	routes.RegisterAuthRoutes(r)
	routes.RegisterRequestRoutes(r)

	err := r.Run()
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	} // Default runs on localhost:8080
}
