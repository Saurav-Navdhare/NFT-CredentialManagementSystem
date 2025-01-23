package repository

import "github.com/holiman/uint256"

type CreateRequestInput struct {
	StudentWallet   string `json:"student_wallet" binding:"required"`
	RecipientWallet string `json:"recipient_wallet" binding:"required"`
	Description     string `json:"description" binding:"required"`
	ExpiryMinutes   int    `json:"expiry_minutes" binding:"required" default:"10080"` // Default: 7 days
}

//type ApproveRequestInput struct {
//	RequestID      string        `json:"request_id" binding:"required"`
//	TranscriptList []uint256.Int `json:"transcript_list" binding:"required"` // Example: ["Transcript1", "Transcript2"]
//}
//
//type RejectRequestInput struct {
//	RequestID string `json:"request_id" binding:"required"`
//	Reason    string `json:"reason"` // Optional
//}

type ResponseEnum string

const (
	Accept ResponseEnum = "accept"
	Reject ResponseEnum = "reject"
)

type RespondRequestInput struct {
	RequestID      string        `json:"request_id" binding:"required"`
	Response       ResponseEnum  `json:"response" binding:"required"`                           // "accept" or "reject"
	TranscriptList []uint256.Int `json:"transcript_list" binding:"required_if=Response accept"` // Example: ["Transcript1", "Transcript2"]
	Reason         string        `json:"reason"`                                                // Optional
}

type WalletTypeEnum string

const (
	StudentWallet   WalletTypeEnum = "student_wallet"
	RecipientWallet WalletTypeEnum = "recipient_wallet"
)

type GetWalletType struct {
	WalletType WalletTypeEnum `json:"wallet_type" binding:"required"` // "student_wallet" or "recipient_wallet"
}
