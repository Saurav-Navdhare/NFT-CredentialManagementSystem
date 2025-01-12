package repository

import "github.com/holiman/uint256"

type CreateRequestInput struct {
	StudentWallet   string `json:"student_wallet" binding:"required"`
	RecipientWallet string `json:"recipient_wallet" binding:"required"`
	Description     string `json:"description" binding:"required"`
	ExpiryMinutes   int    `json:"expiry_minutes" binding:"required"`
}

type ApproveRequestInput struct {
	RequestID      string        `json:"request_id" binding:"required"`
	TranscriptList []uint256.Int `json:"transcript_list" binding:"required"` // Example: ["Transcript1", "Transcript2"]
}

type RejectRequestInput struct {
	RequestID string `json:"request_id" binding:"required"`
	Reason    string `json:"reason"` // Optional
}
