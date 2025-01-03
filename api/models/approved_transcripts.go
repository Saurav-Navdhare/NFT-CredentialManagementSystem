package models

import (
	"github.com/google/uuid"
	"time"
)

type ApprovedTranscript struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key"`
	RequestID    uuid.UUID `gorm:"type:uuid;not null"`
	TranscriptID string    `gorm:"type:varchar(255);not null"`
	ApprovedBy   string    `gorm:"type:varchar(255);not null"`
	ApprovedAt   time.Time `gorm:"not null"`
}
