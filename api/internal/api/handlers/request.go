package handlers

import (
	"api/internal/customErrors"
	"api/internal/initializers"
	"api/internal/models"
	"api/internal/repository"
	"fmt"
	"github.com/ethereum/go-ethereum/log"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"net/http"
	"time"
)

// Verifier Handlers

func CreateRequest(c *gin.Context) {
	walletAddress := c.GetHeader("Wallet-Address")
	var input repository.CreateRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}

	request := models.Request{
		StudentWallet:   input.StudentWallet,
		RecipientWallet: walletAddress,
		Status:          models.Pending,
		ExpiryTimestamp: time.Now().Add(time.Duration(input.ExpiryMinutes) * time.Minute),
	}

	if err := initializers.DB.Create(&request).Error; err != nil {
		log.Error("Failed to create request: ", err)
		panic(customErrors.ErrUnprocessableEntity)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Request created successfully", "request_id": request.ID})
}

// Student Handlers

func RespondRequest(c *gin.Context) {
	walletAddress := c.GetHeader("Wallet-Address")
	var input repository.RespondRequestInput

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}
	input.RequestID = c.Param("request_id")

	// check if fields in input are correct or not
	if err := input.Validate(); err != nil {
		log.Error("Invalid input: ", err)
		panic(err)
		return
	}

	var request models.Request
	if err := initializers.DB.First(&request, "id = ? AND student_wallet = ?", input.RequestID, walletAddress).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}

	if request.Status != models.Pending {
		log.Error("Request is not in a pending state")
		panic(customErrors.ErrRequestNotPending)
		return
	}

	if input.Response == repository.Accept {
		request.Status = models.Approved
		// Convert []uint256.Int to []string
		var transcriptList []string
		for _, t := range input.TranscriptList {
			transcriptList = append(transcriptList, t.String()) // Convert uint256.Int to string as postgres doesn't support it
		}
		request.TranscriptList = transcriptList
		if err := initializers.DB.Model(&request).Updates(map[string]interface{}{
			"status":          models.Approved,
			"transcript_list": pq.Array(transcriptList),
		}).Error; err != nil {
			log.Error("Failed to update request: ", err)
			panic(customErrors.ErrFailedToSaveRequest)
			return
		}
	} else if input.Response == repository.Reject {
		request.Status = models.Denied
		if input.Reason != "" {
			request.Reason = input.Reason
		}
		if err := initializers.DB.Save(&request).Error; err != nil {
			log.Error("Failed to save request: ", err)
			panic(customErrors.ErrFailedToSaveRequest)
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request responded successfully"})
}

func GetRequest(c *gin.Context) {
	walletAddress := c.GetHeader("Wallet-Address")
	var input repository.GetWalletType
	requestID := c.Param("request_id")
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInvalidWalletType)
		return
	}
	if err := input.Validate(); err != nil {
		log.Error("Invalid input: ", err)
		panic(err)
		return
	}

	var request models.Request
	if err := initializers.DB.First(&request, fmt.Sprintf("id = ? AND %v=?", input.WalletType), requestID, walletAddress).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}
	c.JSON(http.StatusOK, request)
}

func GetRequests(c *gin.Context) {
	walletAddress := c.GetHeader("Wallet-Address")
	var input repository.GetWalletType
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}
	var requests []models.Request
	if err := initializers.DB.Find(&requests, fmt.Sprintf("%v = ?", input.WalletType), walletAddress).Error; err != nil {
		log.Error("Failed to get requests: ", err)
		panic(customErrors.ErrInternalServer)
		return
	}
}
