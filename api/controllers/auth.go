package controllers

import (
	"api/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GenerateAndStoreNonce(c *gin.Context) {
	id := utils.GetNonce()
	var data struct {
		WalletAddress string `json:"wallet_address"`
	}
	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Please provide valid wallet address",
		})
		return
	}
	walletAddress := data.WalletAddress
	if walletAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Please provide valid wallet address",
		})
		return
	}
	err := utils.StoreInRedis(walletAddress, id)
	if err != nil {
		fmt.Printf("Error storing in Redis: %v\n", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id": id,
	})
	return
}

func VerifyNonce(c *gin.Context) {
	var data struct {
		WalletAddress string `json:"wallet_address"`
		Signature     string `json:"signature"`
		Nonce         string `json:"nonce"`
	}
	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Please provide valid wallet address",
		})
		return
	}
	// Extract token (digital signature) from query
	signature := data.Signature
	walletAddress := data.WalletAddress
	nonce := data.Nonce
	if signature == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token (digital signature) is required"})
		return
	}

	if walletAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wallet address is required"})
		return
	}

	if nonce == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nonce is required"})
		return
	}

	// Retrieve nonce from Redis
	storedNonce, err := utils.RetrieveFromRedis(walletAddress)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid wallet address"})
		return
	}

	// Compare nonce from Redis with nonce from query
	if storedNonce != nonce {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid nonce"})
		return
	}

	// Verify signature
	isValid, err := utils.VerifySignature(nonce, signature, walletAddress)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid signature"})
		return
	}

	// Delete nonce from Redis
	err = utils.DeleteFromRedis(walletAddress)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Signature verified"})
	return
}
