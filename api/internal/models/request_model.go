package models

import "time"

type RequestStatus string

const (
	Pending  RequestStatus = "pending"
	Approved RequestStatus = "approved"
	Denied   RequestStatus = "denied"
)

// Request model to represent a credential access request.
type Request struct {
	ID              string        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"` // Auto-generate UUID
	StudentWallet   string        `gorm:"type:varchar(255);not null"`                     // Wallet address of the student
	RecipientWallet string        `gorm:"type:varchar(255);not null"`                     // Wallet address of the recipient
	TranscriptList  []string      `gorm:"type:text[]"`                                    // List of transcript identifiers (JSON or Postgres array)
	Status          RequestStatus `gorm:"type:varchar(50);not null;default:'pending'"`    // Status: pending, approved, denied, or revoked
	Reason          string        `gorm:"type:text"`                                      // Reason for denial
	CreatedAt       time.Time     `gorm:"autoCreateTime"`                                 // Creation timestamp
	UpdatedAt       time.Time     `gorm:"autoUpdateTime"`                                 // Update timestamp
	ExpiryTimestamp time.Time     `gorm:"not null"`                                       // Expiry timestamp
}

//type Request struct {
//	ID              string        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
//	StudentWallet   string        `gorm:"type:varchar(255);not null"` // Owner of the transcript
//	RecipientWallet string        `gorm:"type:varchar(255);not null"` // Requesting user
//	Status          RequestStatus `gorm:"type:varchar(50);not null;default:'pending'"`
//	Reason          string        `gorm:"type:text"` // Reason for denial if any
//	CreatedAt       time.Time     `gorm:"autoCreateTime"`
//	UpdatedAt       time.Time     `gorm:"autoUpdateTime"`
//	ExpiryTimestamp time.Time     `gorm:"not null"`
//
//	// One-to-many relationship with RequestTranscript
//	Transcripts []RequestTranscript `gorm:"foreignKey:RequestID;constraint:OnDelete:CASCADE"`
//}
//
//// RequestTranscript stores the transcript IDs associated with a Request.
//type RequestTranscript struct {
//	RequestID    string `gorm:"type:uuid;not null"` // Foreign key to Request
//	TranscriptID string `gorm:"type:text;not null"` // Transcript identifier
//}
