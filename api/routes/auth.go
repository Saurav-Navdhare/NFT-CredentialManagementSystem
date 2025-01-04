package routes

import (
	"api/controllers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	authGroup := router.Group("/auth")
	{
		authGroup.GET("/generate-nonce", controllers.GenerateAndStoreNonce)
		authGroup.POST("/verify-nonce", controllers.VerifyNonce)
	}
}
