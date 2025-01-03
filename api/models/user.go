package models

import (
	"time"
)

type User struct {
	ID            uint   `gorm:"primaryKey"`
	WalletAddress string `gorm:"unique;not null"`
	Nonce         string
	CreatedAt     time.Time
}
