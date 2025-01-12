package handlers

import (
	"api/internal/customErrors"
	"api/pkg/utils"
	"github.com/ethereum/go-ethereum/log"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GenerateAndStoreNonce(c *gin.Context) {
	id := utils.GetNonce()
	var data struct {
		WalletAddress string `json:"wallet_address"`
	}
	if err := c.BindJSON(&data); err != nil {
		panic(customErrors.ErrInsufficientData)
		return
	}
	walletAddress := data.WalletAddress
	if walletAddress == "" {
		panic(customErrors.ErrInsufficientData)
		return
	}
	err := utils.StoreInRedis(walletAddress, id)
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
