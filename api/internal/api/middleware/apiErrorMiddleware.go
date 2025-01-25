package middleware

import (
	"api/internal/customErrors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func ApiErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error for debugging purposes
				log.Printf("Recovered from panic: %v", err)

				// Handle custom API errors
				if apiErr, ok := err.(*customErrors.ApiError); ok {
					c.JSON(apiErr.Status, gin.H{
						"error":       apiErr.Message,
						"status_code": apiErr.Status,
					})
				} else {
					// Handle unexpected errors
					c.JSON(http.StatusInternalServerError, gin.H{
						"error":       "Internal server error",
						"status_code": http.StatusInternalServerError,
					})
				}
				c.Abort()
			}
		}()
		c.Next()
	}
}
