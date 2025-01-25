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
//	ID              string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"` // Auto-generate UUID
//	StudentWallet   string    `gorm:"type:varchar(255);not null"`                     // Wallet address of the student
//	RecipientWallet string    `gorm:"type:varchar(255);not null"`                     // Wallet address of the recipient
//	Description     string    `gorm:"type:text"`                                      // Request description or reason
//	CreatedAt       time.Time `gorm:"autoCreateTime"`                                 // Creation timestamp
//	UpdatedAt       time.Time `gorm:"autoUpdateTime"`                                 // Update timestamp
//	ExpiryTimestamp time.Time `gorm:"not null"`                                       // Expiry timestamp (default: 7 days)
//}
//
//type RespondedRequest struct {
//	ID             string        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`                    // Auto-generate UUID
//	RequestID      string        `gorm:"type:uuid;not null;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`  // Foreign key referencing `Request.ID`
//	Request        Request       `gorm:"foreignKey:RequestID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"` // Establish relationship with `Request`
//	Response       RequestStatus `gorm:"type:varchar(50);not null"`                                         // Response: accept or reject
//	Reason         string        `gorm:"type:text"`                                                         // Reason for rejection (optional)
//	TranscriptList []uint64      `gorm:"type:bigint[]"`                                                     // List of transcript identifiers (JSON or Postgres array)
//	CreatedAt      time.Time     `gorm:"autoCreateTime"`                                                    // Creation timestamp
//	UpdatedAt      time.Time     `gorm:"autoUpdateTime"`                                                    // Update timestamp
//}
