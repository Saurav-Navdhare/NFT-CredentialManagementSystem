package middleware

import (
	"api/internal/customErrors"
	"api/pkg/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

func SessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		WalletAddress := c.GetHeader("Wallet-Address")
		sessionToken := c.GetHeader("Session-Token")

		if WalletAddress == "" {
			panic(customErrors.ErrNoWalletAddressHeader)
			return
		}

		if sessionToken == "" {
			// No session exists; create a new one
			Signature := c.GetHeader("Signature")
			if Signature == "" {
				panic(customErrors.ErrInsufficientHeaders)
				return
			}
			storedNonce, err := utils.RetrieveFromRedis(WalletAddress)
			if err != nil {
				panic(customErrors.ErrRequestNotFound)
				return
			}

			signature, err := utils.VerifySignature(storedNonce, Signature, WalletAddress)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Error verifying signature"})
				c.Abort()
			}

			if !signature {
				panic(customErrors.ErrInvalidSignature)
				return
			}
			// if signature is valid, delete the nonce
			err = utils.DeleteFromRedis(WalletAddress)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
				// error log
				c.Abort()
				return
			}
			newToken, err := utils.CreateSession(WalletAddress)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
				c.Abort()
				return
			}
			c.Header("Session-Token", newToken)
		} else {
			// Validate session
			valid, err := utils.ValidateSession(WalletAddress, sessionToken)
			if err != nil || !valid {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
