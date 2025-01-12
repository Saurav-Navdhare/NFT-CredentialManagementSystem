package handlers

import (
	"api/internal/customErrors"
	"api/internal/initializers"
	"api/internal/models"
	"api/internal/repository"
	"encoding/json"
	"github.com/ethereum/go-ethereum/log"
	"github.com/gin-gonic/gin"
	"github.com/holiman/uint256"
	"net/http"
	"time"
)

// Verifier Handlers

func CreateRequest(c *gin.Context) {
	var input repository.CreateRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}

	request := models.Request{
		StudentWallet:   input.StudentWallet,
		RecipientWallet: input.RecipientWallet,
		Status:          "pending",
		ExpiryTimestamp: time.Now().Add(time.Duration(input.ExpiryMinutes) * time.Minute),
	}

	if err := initializers.DB.Create(&request).Error; err != nil {
		log.Error("Failed to create request: ", err)
		panic(customErrors.ErrUnprocessableEntity)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Request created successfully", "request_id": request.ID})
}

func GetVerifierPendingRequests(c *gin.Context) {
	walletAddress := c.Query("wallet_address")
	if walletAddress == "" {
		log.Error("Insufficient data")
		panic(customErrors.ErrInsufficientData)
		return
	}
	var requests []models.Request
	if err := initializers.DB.Find(&requests, "recipient_wallet = ? AND status = ?", walletAddress, "pending").Error; err != nil {
		log.Error("Failed to get requests: ", err)
		panic(customErrors.ErrInternalServer)
		return
	}
}

func GetVerifierApprovedRequests(c *gin.Context) {
	walletAddress := c.Query("wallet_address")
	if walletAddress == "" {
		log.Error("Insufficient data")
		panic(customErrors.ErrInsufficientData)
		return
	}
	var requests []models.Request
	if err := initializers.DB.Find(&requests, "recipient_wallet = ? AND status = ? AND expiry_timestamp > ?", walletAddress, "approved", time.Now()).Error; err != nil {
		log.Error("Failed to get requests: ", err)
		panic(customErrors.ErrInternalServer)
		return
	}
}

func GetVerifierTranscriptList(c *gin.Context) {
	requestID := c.Param("request_id")
	var request models.Request
	if err := initializers.DB.First(&request, "id = ?", requestID).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}

	if request.Status != "approved" {
		log.Error("Request is not in an approved state")
		panic(customErrors.ErrRequestNotPending)
		return
	}

	var transcriptList []uint256.Int
	if err := json.Unmarshal([]byte(request.TranscriptList), &transcriptList); err != nil {
		log.Error("Failed to unmarshal transcript list: ", err)
		panic(customErrors.ErrFailedToConvertJSON)
		return
	}

}

// Student Handlers

func ApproveRequest(c *gin.Context) {
	var input repository.ApproveRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}

	var request models.Request
	if err := initializers.DB.First(&request, "id = ?", input.RequestID).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}

	if request.Status != "pending" {
		log.Error("Request is not in a pending state")
		panic(customErrors.ErrRequestNotPending)
		return
	}

	request.Status = "approved"
	transcriptListJSON, err := json.Marshal(input.TranscriptList)
	if err != nil {
		log.Error("Failed to convert transcript list to JSON: ", err)
		panic(customErrors.ErrFailedToConvertJSON)
		return
	}
	request.TranscriptList = string(transcriptListJSON)
	if err := initializers.DB.Save(&request).Error; err != nil {
		log.Error("Failed to save request: ", err)
		panic(customErrors.ErrFailedToSaveRequest)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request approved successfully"})
}

func RejectRequest(c *gin.Context) {
	var input repository.RejectRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}

	var request models.Request
	if err := initializers.DB.First(&request, "id = ?", input.RequestID).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}

	if request.Status != "pending" {
		log.Error("Request is not in a pending state")
		panic(customErrors.ErrRequestNotPending)
		return
	}

	request.Status = "denied"
	if err := initializers.DB.Save(&request).Error; err != nil {
		log.Error("Failed to deny request: ", err)
		panic(customErrors.ErrFailedToSaveRequest)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request denied successfully"})
}

func GetRequest(c *gin.Context) {
	requestID := c.Param("request_id")
	var request models.Request
	if err := initializers.DB.First(&request, "id = ?", requestID).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}

	c.JSON(http.StatusOK, request)
}

func GetRequests(c *gin.Context) {
	walletAddress := c.Query("wallet_address")
	if walletAddress == "" {
		log.Error("Insufficient data")
		panic(customErrors.ErrInsufficientData)
		return
	}
	var requests []models.Request
	if err := initializers.DB.Find(&requests, "student_wallet = ?", walletAddress).Error; err != nil {
		log.Error("Failed to get requests: ", err)
		panic(customErrors.ErrInternalServer)
		return
	}
}

