package utils

import (
	"api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"time"
)

// DTO for Smart Contract response
type TranscriptResponse struct {
	RequestID    string `json:"request_id"`
	TranscriptID string `json:"transcript_id"`
	ApprovedBy   string `json:"approved_by"`
	ApprovedAt   string `json:"approved_at"`
}

// Fetch approved transcripts
func GetApprovedTranscripts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.Param("request_id")
		var transcripts []models.ApprovedTranscript

		// Fetch approved transcripts from the database
		if err := db.Where("request_id = ?", requestID).Find(&transcripts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transcripts"})
			return
		}

		// Format the response
		var response []TranscriptResponse
		for _, transcript := range transcripts {
			response = append(response, TranscriptResponse{
				RequestID:    transcript.RequestID.String(),
				TranscriptID: transcript.TranscriptID,
				ApprovedBy:   transcript.ApprovedBy,
				ApprovedAt:   transcript.ApprovedAt.Format(time.RFC3339),
			})
		}

		// Send the response
		c.JSON(http.StatusOK, gin.H{"transcripts": response})
	}
}
