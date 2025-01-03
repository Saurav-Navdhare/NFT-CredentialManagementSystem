package controllers

import (
	"api/initializers"
	"context"
	"errors"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"net/http"
	"time"
)

func GenerateNonce(c *gin.Context) {
	var input struct {
		WalletAddress string `json:"wallet_address"`
	}

	var ctx = context.Background()

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	nonce := uuid.New().String()
	err := initializers.RedisClient.Set(ctx, input.WalletAddress, nonce, 5*time.Minute).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save nonce"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"nonce": nonce})
}

func VerifySignature(c *gin.Context) {
	var input struct {
		WalletAddress string `json:"wallet_address"`
		Signature     string `json:"signature"`
	}

	var ctx = context.Background()

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	nonce, err := initializers.RedisClient.Get(ctx, input.WalletAddress).Result()
	if errors.Is(err, redis.Nil) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Nonce not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve nonce"})
		return
	}

	hash := crypto.Keccak256Hash([]byte(nonce))
	sigPublicKey, err := crypto.SigToPub(hash.Bytes(), []byte(input.Signature))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
		return
	}

	recoveredAddress := crypto.PubkeyToAddress(*sigPublicKey).Hex()
	if recoveredAddress != input.WalletAddress {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Signature verification failed"})
		return
	}

	err = initializers.RedisClient.Del(ctx, input.WalletAddress).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete nonce"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Authentication successful"})
}
