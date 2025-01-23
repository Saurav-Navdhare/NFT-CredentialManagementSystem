package handlers

import (
	"api/internal/customErrors"
	"api/pkg/constants"
	"api/pkg/utils"
	"github.com/ethereum/go-ethereum/log"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GenerateAndStoreNonce(c *gin.Context) {
	walletAddress := c.GetHeader("Wallet-Address")
	if walletAddress == "" {
		panic(customErrors.ErrNoWalletAddressHeader)
		return
	}

	id := utils.GetNonce()
	err := utils.StoreInRedis(walletAddress, id, constants.NonceTokenTimeout)

	if err != nil {
		log.Error("Error storing in Redis", "error", err)
		panic(customErrors.ErrInternalServer)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id": id,
	})
	return
}
