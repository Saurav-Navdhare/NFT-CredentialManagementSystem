package utils

import "github.com/google/uuid"

func GetNonce() string {
	id := uuid.New().String()
	return id
}
