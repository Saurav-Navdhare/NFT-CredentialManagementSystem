package middleware

import (
	"api/internal/customErrors"
	"github.com/gin-gonic/gin"
	"net/http"
)

func ApiErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				if apiErr, ok := err.(*customErrors.ApiError); ok {
					c.JSON(apiErr.Status, gin.H{"error": apiErr.Message})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
				}
			}
		}()
		c.Next()
	}
}
