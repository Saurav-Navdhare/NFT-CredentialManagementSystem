package utils

import (
	"api/pkg/constants"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"github.com/redis/go-redis/v9"
)

func GenerateSessionToken() (string, error) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func CreateSession(address string) (string, error) {
	sessionToken, err := GenerateSessionToken()
	if err != nil {
		return "", err
	}
	address = fmt.Sprintf("session:%s", address)
	err = StoreInRedis(address, sessionToken, constants.SessionTokenTimeout)
	if err != nil {
		return "", err
	}
	return sessionToken, nil
}

func ValidateSession(address, sessionToken string) (bool, error) {
	address = fmt.Sprintf("session:%s", address)
	storedToken, err := RetrieveFromRedis(address)
	if errors.Is(err, redis.Nil) {
		return false, nil // No session exists
	} else if err != nil {
		return false, err
	}
	return storedToken == sessionToken, nil
}
