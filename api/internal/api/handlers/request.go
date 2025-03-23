package handlers

import (
	"api/internal/customErrors"
	"api/internal/initializers"
	"api/internal/models"
	"api/internal/repository"
	"api/pkg/utils"
	"fmt"
	"github.com/ethereum/go-ethereum/log"
	"github.com/gin-gonic/gin"
	//"github.com/lib/pq"
	//"gorm.io/gorm"
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

	if err := utils.CreateRequest(initializers.DB, request.StudentWallet, request.RecipientWallet); err != nil {
		log.Error("Failed to create request: ", err)
		panic(customErrors.ErrUnprocessableEntity)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Request created successfully", "request_id": request.ID})
}

// Student Handlers

func RespondRequest(c *gin.Context) {
	// Get student's wallet address from header
	walletAddress := c.GetHeader("Wallet-Address")
	var input repository.RespondRequestInput

	// Bind input JSON payload
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}

	// Set RequestID from URL parameter
	input.RequestID = c.Param("request_id")

	// Validate input fields using the Validate method
	if err := input.Validate(); err != nil {
		log.Error("Invalid input: ", err)
		panic(err)
		return
	}

	// Find the request belonging to this student
	var request models.Request
	if err := initializers.DB.First(&request, "id = ? AND student_wallet = ?", input.RequestID, walletAddress).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}

	// Check that the request is in a pending state
	if request.Status != models.Pending {
		log.Error("Request is not in a pending state")
		panic(customErrors.ErrRequestNotPending)
		return
	}

	// Process the response
	if input.Response == repository.Accept {
		// Set status to Approved
		request.Status = models.Approved
		request.UpdatedAt = time.Now()

		// Insert transcript records into the RequestTranscript table.
		// Optional: Clear existing transcript records if needed:
		if err := initializers.DB.Where("request_id = ?", request.ID).Delete(&models.RequestTranscript{}).Error; err != nil {
			log.Error("Failed to delete existing transcripts: ", err)
			panic(customErrors.ErrFailedToSaveRequest)
			return
		}

		// For each transcript provided in the input, create a RequestTranscript record.

		// NOTE: Check in blockchain if all the transcripts in the list are owned by student_wallet

		for _, transcript := range input.TranscriptList {
			rt := models.RequestTranscript{
				RequestID:    request.ID,
				TranscriptID: transcript.String(), // Convert uint256.Int to string if needed
			}
			if err := initializers.DB.Create(&rt).Error; err != nil {
				log.Error("Failed to store transcript record: ", err)
				panic(customErrors.ErrFailedToSaveRequest)
				return
			}
		}

		// Update the request record in the database
		if err := initializers.DB.Model(&request).Updates(map[string]interface{}{
			"status":     request.Status,
			"updated_at": request.UpdatedAt,
		}).Error; err != nil {
			log.Error("Failed to update request: ", err)
			panic(customErrors.ErrFailedToSaveRequest)
			return
		}

	} else if input.Response == repository.Reject {
		// Set status to Denied and update the reason if provided
		request.Status = models.Denied
		if input.Reason != "" {
			request.Reason = input.Reason
		}
		request.UpdatedAt = time.Now()
		if err := initializers.DB.Save(&request).Error; err != nil {
			log.Error("Failed to save request: ", err)
			panic(customErrors.ErrFailedToSaveRequest)
			return
		}
	} else {
		log.Error("Invalid response value")
		panic(customErrors.ErrInvalidData)
		return
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
	//if err := initializers.DB.First(&request, fmt.Sprintf("id = ? AND %v=?", input.WalletType), requestID, walletAddress).Error; err != nil {
	if err := initializers.DB.First(&request, "id = ? AND ? = ?", requestID, input.WalletType, walletAddress).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}
	//var response gin.H
	//if request.Status == models.Approved {
	//	//var transcript models.RequestTranscript
	//	var transcripts []models.RequestTranscript
	//	if err := initializers.DB.Find(&transcripts, "request_id = ?", request.ID).Error; err != nil {
	//		log.Error("Failed to get transcript: ", err)
	//		panic(customErrors.ErrInternalServer)
	//		return
	//	}
	//	response = gin.H{
	//		"request_id":  request.ID,
	//		"status":      request.Status,
	//		"reason":      request.Reason,
	//		"transcripts": transcripts,
	//	}
	//} else {
	//	response = gin.H{
	//		"request_id": request.ID,
	//		"status":     request.Status,
	//		"reason":     request.Reason,
	//	}
	//}
	query := initializers.DB.Where("id = ? AND ? = ?", requestID, input.WalletType, walletAddress)

	if err := query.First(&request).Error; err != nil {
		log.Error("Request not found: ", err)
		panic(customErrors.ErrRequestNotFound)
	}

	response := gin.H{
		"request_id":       request.ID,
		"status":           request.Status,
		"recipient_wallet": request.RecipientWallet,
		"student_wallet":   request.StudentWallet,
		"expiry_timestamp": request.ExpiryTimestamp,
	}

	// Now we can check the status and perform additional actions if needed
	switch request.Status {
	case models.Approved:
		// Fetch transcripts only if status is Approved
		var transcripts []models.RequestTranscript
		if err := initializers.DB.Where("request_id = ?", request.ID).Find(&transcripts).Error; err != nil {
			log.Error("Failed to fetch transcripts: ", err)
			panic(customErrors.ErrInternalServer)
		}
		var transcriptList []gin.H
		for _, transcript := range transcripts {
			transcriptList = append(transcriptList, gin.H{
				"request_id":    transcript.RequestID,
				"transcript_id": transcript.TranscriptID,
			})
		}
		response["transcripts"] = transcriptList

	case models.Denied:
		response["reason"] = request.Reason
	}
	c.JSON(http.StatusOK, response)
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
