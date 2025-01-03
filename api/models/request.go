package models

import (
	"github.com/google/uuid"
	"time"
)

type TranscriptRequest struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey"`
	StudentWallet   string    `gorm:"not null"`
	RecipientWallet string    `gorm:"not null"`
	Status          string    `gorm:"default:Pending"`
	ExpiresAt       time.Time
	CreatedAt       time.Time
}
