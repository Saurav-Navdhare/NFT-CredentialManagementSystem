package models

import "time"

type RequestStatus string

const (
	Pending  RequestStatus = "pending"
	Approved RequestStatus = "approved"
	Denied   RequestStatus = "denied"
)

// Request represents a request to access a student's transcript.
type Request struct {
	ID              string        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"` // Auto-generate UUID
	StudentWallet   string        `gorm:"type:varchar(255);not null"`                     // Owner of the transcript
	RecipientWallet string        `gorm:"type:varchar(255);not null"`                     // Requesting user
	Status          RequestStatus `gorm:"type:varchar(50);not null;default:'pending'"`    // Status: pending, approved, denied
	Reason          string        `gorm:"type:text"`                                      // Reason for denial
	CreatedAt       time.Time     `gorm:"autoCreateTime"`                                 // Creation timestamp
	UpdatedAt       time.Time     `gorm:"autoUpdateTime"`                                 // Update timestamp
	ExpiryTimestamp time.Time     `gorm:"not null"`                                       // Expiry timestamp

	Transcripts []RequestTranscript `gorm:"foreignKey:RequestID;constraint:OnDelete:CASCADE"` // Related transcripts
}

// RequestTranscript stores the list of transcript IDs linked to a request.
type RequestTranscript struct {
	RequestID    string `gorm:"type:uuid;not null"` // Foreign key (Request ID)
	TranscriptID string `gorm:"type:text;not null"` // Transcript identifier
}
