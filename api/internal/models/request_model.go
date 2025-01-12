package models

import (
	"time"
)

// Request model to represent a credential access request.
type Request struct {
	ID              string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"` // Auto-generate UUID
	StudentWallet   string    `gorm:"type:varchar(255);not null"`                     // Wallet address of the student
	RecipientWallet string    `gorm:"type:varchar(255);not null"`                     // Wallet address of the recipient
	TranscriptList  string    `gorm:"type:text"`                                      // List of transcript identifiers (JSON or comma-separated)
	Status          string    `gorm:"type:varchar(50);not null;default:'pending'"`    // Status: pending, approved, denied, or revoked
	CreatedAt       time.Time `gorm:"autoCreateTime"`                                 // Creation timestamp
	UpdatedAt       time.Time `gorm:"autoUpdateTime"`                                 // Update timestamp
	ExpiryTimestamp time.Time `gorm:"not null"`                                       // Expiry timestamp
}
