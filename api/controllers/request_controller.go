package controllers

import (
	"api/initializers"
	"api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"time"
)

// CreateRequest: Create a new transcript request
func CreateRequest(c *gin.Context) {
	var input struct {
		StudentWallet   string `json:"student_wallet"`
		RecipientWallet string `json:"recipient_wallet"`
		ExpiryMinutes   int    `json:"expiry_minutes"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	request := models.TranscriptRequest{
		ID:              uuid.New(),
		StudentWallet:   input.StudentWallet,
		RecipientWallet: input.RecipientWallet,
		ExpiresAt:       time.Now().Add(time.Duration(input.ExpiryMinutes) * time.Minute),
	}

	if err := initializers.DB.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"request_id": request.ID})
}
