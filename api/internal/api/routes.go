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
			sessionGroup := requestGroup.Group("/")
			{
				sessionGroup.Use(middleware.SessionMiddleware())
				sessionGroup.GET("/", handlers.GetRequests)
				sessionGroup.GET("/:request_id", handlers.GetRequest)
			}
			digitalSignatureGroup := requestGroup.Group("/")
			{
				digitalSignatureGroup.Use(middleware.VerifyDigitalSignatureMiddleware())
				digitalSignatureGroup.POST("/create", handlers.CreateRequest)               // add mandatory nonce verifier
				digitalSignatureGroup.POST("/respond/:request_id", handlers.RespondRequest) // add mandatory nonce verifier
			}
		}
	}
}
