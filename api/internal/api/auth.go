package api

import (
	"api/internal/api/handlers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	authGroup := router.Group("/auth")
	{
		authGroup.GET("/generate-nonce", handlers.GenerateAndStoreNonce)
		authGroup.POST("/verify-nonce", handlers.VerifyNonce)
	}
}
