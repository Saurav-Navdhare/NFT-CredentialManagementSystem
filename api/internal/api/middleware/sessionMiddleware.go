package middleware

import (
	"api/internal/customErrors"
	"api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func VerifyDigitalSignatureMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		err := utils.VerifyDigitalSignature(c)
		if err != nil {
			panic(err)
		}
		c.Next()
	}
}

func SessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		WalletAddress := c.GetHeader("Wallet-Address")
		sessionToken := c.GetHeader("Session-Token")

		if WalletAddress == "" {
			panic(customErrors.ErrNoWalletAddressHeader)
		}

		if sessionToken == "" {
			if err := utils.VerifyDigitalSignature(c); err != nil {
				panic(err)
			}
		} else {
			// Validate session
			valid, err := utils.ValidateSession(WalletAddress, sessionToken)
			if err != nil || !valid {
				panic(customErrors.ErrInvalidSessionToken)
			}
		}
		c.Next()
	}
}
