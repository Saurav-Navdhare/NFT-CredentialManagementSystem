package initializers

import (
	"github.com/joho/godotenv"
	"log"
)

func LoadENV() {
	// Load the .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}
