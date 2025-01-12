package middleware

import (
	"api/pkg/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

func NonceAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		WalletAddress := c.GetHeader("Wallet-Address")
		Signature := c.GetHeader("Signature")

		if Signature == "" || WalletAddress == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
			c.Abort()
			return
		}

		storedNonce, err := utils.RetrieveFromRedis(WalletAddress)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Nonce not found"})
			c.Abort()
			return
		}

		signature, err := utils.VerifySignature(storedNonce, Signature, WalletAddress)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error verifying signature"})
			c.Abort()
		}

		if !signature {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
			c.Abort()
			return
		}

		// Set wallet address in context for later use
		c.Set("walletAddress", WalletAddress)
		c.Next()
	}
}
