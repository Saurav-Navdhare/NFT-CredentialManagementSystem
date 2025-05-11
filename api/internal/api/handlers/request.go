package handlers

import (
	"api/internal/customErrors"
	"api/internal/initializers"
	"api/internal/models"
	"api/internal/repository"
	"api/pkg/utils"
	"errors"
	"fmt"
	"gorm.io/gorm"

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

	request, err := utils.CreateRequestEntry(initializers.DB, request)

	if err != nil {
		log.Error("Failed to create request: ", err)
		panic(customErrors.ErrUnprocessableEntity)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Request created successfully", "request": request})
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

		for _, transcriptID := range input.TranscriptList {
			var transcript models.Transcript
			if err := initializers.DB.First(&transcript, "transcript_id = ? AND owner_wallet = ?", transcriptID.String(), walletAddress).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					log.Error("Transcript not found or not owned by the wallet address: ", transcriptID.String())
					panic(customErrors.ErrUnauthorizedTranscript)
				}
				log.Error("Database error while checking transcript ownership: ", err)
				panic(customErrors.ErrInternalServer)
			}
			// Set status to Approved
			request.Status = models.Approved
			request.UpdatedAt = time.Now()

			// Clear existing transcript records if needed
			if err := initializers.DB.Where("request_id = ?", request.ID).Delete(&models.RequestTranscript{}).Error; err != nil {
				log.Error("Failed to delete existing transcripts: ", err)
				panic(customErrors.ErrFailedToSaveRequest)
			}

			// For each transcript provided in the input, create a RequestTranscript record
			for _, transcript := range input.TranscriptList {
				rt := models.RequestTranscript{
					RequestID:    request.ID,
					TranscriptID: transcript.String(),
				}
				if err := initializers.DB.Create(&rt).Error; err != nil {
					log.Error("Failed to store transcript record: ", err)
					panic(customErrors.ErrFailedToSaveRequest)
				}
			}

			// Update the request record in the database
			if err := initializers.DB.Model(&request).Updates(map[string]interface{}{
				"status":     request.Status,
				"updated_at": request.UpdatedAt,
			}).Error; err != nil {
				log.Error("Failed to update request: ", err)
				panic(customErrors.ErrFailedToSaveRequest)
			}
			//rt := models.RequestTranscript{
			//	RequestID:    request.ID,
			//	TranscriptID: transcript.String(), // Convert uint256.Int to string if needed
			//}
			//if err := initializers.DB.Create(&rt).Error; err != nil {
			//	log.Error("Failed to store transcript record: ", err)
			//	panic(customErrors.ErrFailedToSaveRequest)
			//	return
			//}
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
	// Get wallet address from headers
	walletAddress := c.GetHeader("Wallet-Address")
	requestID := c.Param("request_id")

	// Parse JSON input to get wallet type (student_wallet or recipient_wallet)
	var input repository.GetWalletType
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Invalid wallet type binding: ", err)
		panic(customErrors.ErrInvalidWalletType)
		return
	}

	// Optional: validate wallet type if needed
	if err := input.Validate(); err != nil {
		log.Error("Wallet type validation failed: ", err)
		panic(err)
		return
	}

	// Ensure walletType is either "student_wallet" or "recipient_wallet"
	var request models.Request
	var err error

	switch input.WalletType {
	case repository.StudentWallet:
		err = initializers.DB.
			Where("id = ? AND student_wallet = ?", requestID, walletAddress).
			First(&request).Error
	case repository.RecipientWallet:
		err = initializers.DB.
			Where("id = ? AND recipient_wallet = ?", requestID, walletAddress).
			First(&request).Error
	default:
		log.Error("Invalid wallet type used in query")
		panic(customErrors.ErrInvalidWalletType)
		return
	}

	if err != nil {
		log.Error("Request not found or DB error: ", err)
		panic(customErrors.ErrRequestNotFound)
		return
	}

	// Build the base response
	response := gin.H{
		"request_id":       request.ID,
		"status":           request.Status,
		"recipient_wallet": request.RecipientWallet,
		"student_wallet":   request.StudentWallet,
		"expiry_timestamp": request.ExpiryTimestamp,
	}

	// Add reason or transcripts depending on status
	switch request.Status {
	case models.Approved:
		var transcripts []models.RequestTranscript
		if err := initializers.DB.
			Where("request_id = ?", request.ID).
			Find(&transcripts).Error; err != nil {
			log.Error("Failed to fetch transcripts: ", err)
			panic(customErrors.ErrInternalServer)
			return
		}
		var transcriptList []gin.H
		for _, t := range transcripts {
			transcriptList = append(transcriptList, gin.H{
				"request_id":    t.RequestID,
				"transcript_id": t.TranscriptID,
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
