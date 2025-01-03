package routes

import (
	"api/controllers"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/nonce", controllers.GenerateNonce)
		auth.POST("/verify", controllers.VerifySignature)
	}
}
