package utils

import (
	"api/internal/models"
	"gorm.io/gorm"
	"time"
)

func CreateRequest(db *gorm.DB, studentWallet, recipientWallet string) error {
	request := models.Request{
		StudentWallet:   studentWallet,
		RecipientWallet: recipientWallet,
		Status:          models.Pending,
		ExpiryTimestamp: time.Now().Add(7 * 24 * time.Hour),
	}

	// Create request first
	if err := db.Create(&request).Error; err != nil {
		return err
	}
	return nil
}

func GetApprovedTranscripts(db *gorm.DB, recipientWallet string) ([]string, error) {
	var transcriptIDs []string

	err := db.Table("request_transcripts").
		Select("request_transcripts.transcript_id").
		Joins("JOIN requests ON requests.id = request_transcripts.request_id").
		Where("requests.recipient_wallet = ? AND requests.status = ?", recipientWallet, models.Approved).
		Pluck("request_transcripts.transcript_id", &transcriptIDs).Error

	return transcriptIDs, err
}

func GetRequestsForStudent(db *gorm.DB, studentWallet string) ([]models.Request, error) {
	var requests []models.Request
	err := db.Where("student_wallet = ?", studentWallet).Find(&requests).Error
	return requests, err
}
