package routes

import (
	"api/controllers"
	"github.com/gin-gonic/gin"
)

func RegisterRequestRoutes(router *gin.Engine) {
	requests := router.Group("/requests")
	{
		requests.POST("/create", controllers.CreateRequest)
	}
}
