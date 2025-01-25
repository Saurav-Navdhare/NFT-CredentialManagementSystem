package utils

import (
	"api/internal/customErrors"
	"github.com/gin-gonic/gin"
)

func VerifyDigitalSignature(c *gin.Context) error {
	WalletAddress := c.GetHeader("Wallet-Address")
	Signature := c.GetHeader("Signature")

	if WalletAddress == "" {
		return customErrors.ErrNoWalletAddressHeader
	}

	if Signature == "" {
		return customErrors.ErrInsufficientHeaders
	}

	storedNonce, err := RetrieveFromRedis(WalletAddress)
	if err != nil {
		return customErrors.ErrRequestNotFound
	}

	signature, err := VerifySignature(storedNonce, Signature, WalletAddress)
	if err != nil {
		return customErrors.ErrInvalidSignature

	}

	if !signature {
		return customErrors.ErrInvalidSignature
	}

	// if signature is valid, delete the nonce
	err = DeleteFromRedis(WalletAddress)
	if err != nil {
		return customErrors.ErrFailedToCreateNonce
	}

	newToken, err := CreateSession(WalletAddress)
	if err != nil {
		return customErrors.ErrFailedToCreateSession
	}
	c.Header("Session-Token", newToken)
	return nil
}
