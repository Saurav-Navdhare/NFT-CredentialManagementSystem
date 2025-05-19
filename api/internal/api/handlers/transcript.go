package handlers

import (
	"api/internal/customErrors"
	"api/internal/initializers"
	"api/internal/models"
	"api/internal/repository"
	"api/pkg/utils"
	"net/http"

	"github.com/ethereum/go-ethereum/log"
	"github.com/gin-gonic/gin"
)

// Transcript represents a student's transcript stored on IPFS.
//type Transcript struct {
//	TranscriptID     string `gorm:"primaryKey;type:text"` // Primary Key
//	IPFSURIMetadata  string `gorm:"type:text"`            // Metadata URI on IPFS
//	IPFSURIMediaHash string `gorm:"type:text"`            // Actual content URI (e.g., PDF, image) on IPFS
//
//	Requests []RequestTranscript `gorm:"foreignKey:TranscriptID;constraint:OnDelete:CASCADE"` // Back-reference
//}

func AddTranscript(c *gin.Context) {
	// Get student's wallet address from header
	var input repository.TranscriptInput

	// Bind input JSON payload
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Error("Binding error: ", err)
		panic(customErrors.ErrInsufficientData)
		return
	}

	transcript := models.Transcript{
		TranscriptID:     input.TranscriptID,
		IPFSURIMetadata:  input.IPFSURIMetadata,
		IPFSURIMediaHash: input.IPFSURIMediaHash,
		OwnerWallet:      input.OwnerWallet,
	}

	transcript, err := utils.CreateTranscriptEntry(initializers.DB, transcript)
	if err != nil {
		log.Error("Failed to create transcript: ", err) // <-- fixed
		panic(customErrors.ErrRequestNotFound)          // or proper mapping of DB error
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Transcript created successfully", "transcript": transcript})
}

func GetTranscripts(c *gin.Context) {
	// Get student's wallet address from header
	walletAddress := c.GetHeader("Wallet-Address")

	// Get approved transcripts for the student
	transcriptIDs, err := utils.GetApprovedTranscript(initializers.DB, walletAddress)
	if err != nil {
		log.Error("Failed to get approved transcripts: ", err)
		panic(customErrors.ErrUnprocessableEntity)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Approved transcripts retrieved successfully", "transcripts": transcriptIDs})
}

func CheckAccess(c *gin.Context) {
	// Get student's wallet address from header
	walletAddress := c.GetHeader("Wallet-Address")
	ipfsURI := c.Param("ipfs_uri")
	if ipfsURI == "" {
		log.Error("IPFS URI is required")
		panic(customErrors.ErrInsufficientData)
		return
	}
	// Check if the student has access to the IPFS URI
	hasAccess, err := utils.CheckAccess(initializers.DB, walletAddress, ipfsURI)
	if err != nil {
		log.Error("Failed to check access: ", err)
		panic(customErrors.ErrUnprocessableEntity)
		return
	}
	if hasAccess {
		c.JSON(http.StatusOK, gin.H{"message": "Access granted"})
	} else {
		c.JSON(http.StatusForbidden, gin.H{"message": "Access denied"})
	}
}
