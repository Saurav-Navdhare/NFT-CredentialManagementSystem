package api

import (
	"api/internal/api/handlers"
	"api/internal/api/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.Use(middleware.ApiErrorHandler())
	version := router.Group("/v1")
	{
		authGroup := version.Group("/auth")
		{
			authGroup.GET("/generate-nonce", handlers.GenerateAndStoreNonce)
		}
		requestGroup := version.Group("/requests")
		{
			requestGroup.Use(middleware.SessionMiddleware())
			requestGroup.GET("/", handlers.GetRequests)
			requestGroup.POST("/create", handlers.CreateRequest)
			requestGroup.POST("/respond", handlers.RespondRequest)
			requestGroup.GET("/:request_id", handlers.GetRequest)
		}
	}
}
