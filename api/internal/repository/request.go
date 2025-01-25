package repository

import (
	"api/internal/customErrors"
	"github.com/holiman/uint256"
)

type CreateRequestInput struct {
	StudentWallet string `json:"student_wallet" binding:"required"`
	//RecipientWallet string `json:"recipient_wallet" binding:"required"`	// it will be taken from Header of Wallet-Address
	Description   string `json:"description" binding:"required"`
	ExpiryMinutes int    `json:"expiry_minutes" default:"10080"` // Default: 7 days
}

type ResponseEnum string

const (
	Accept ResponseEnum = "accept"
	Reject ResponseEnum = "reject"
)

type RespondRequestInput struct {
	RequestID      string        `json:"request_id"`                  // it will be taken from param
	Response       ResponseEnum  `json:"response" binding:"required"` // "accept" or "reject"
	TranscriptList []uint256.Int `json:"transcript_list"`             // Example: ["Transcript1", "Transcript2"]
	Reason         string        `json:"reason"`                      // Optional
}

func (r *RespondRequestInput) Validate() interface{} {
	if !((r.Response == Accept && len(r.TranscriptList) != 0) || r.Response == Reject) {
		return customErrors.ErrInvalidData
	}
	return nil
}

type WalletTypeEnum string

const (
	StudentWallet   WalletTypeEnum = "student_wallet"
	RecipientWallet WalletTypeEnum = "recipient_wallet"
)

type GetWalletType struct {
	WalletType WalletTypeEnum `json:"wallet_type" binding:"required"` // "student_wallet" or "recipient_wallet"
}

func (g *GetWalletType) Validate() interface{} {
	if !(g.WalletType == StudentWallet || g.WalletType == RecipientWallet) {
		return customErrors.ErrInvalidWalletType
	}
	return nil
}
