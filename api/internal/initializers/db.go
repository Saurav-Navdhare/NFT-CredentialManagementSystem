package initializers

import (
	"api/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
	"os"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("POSTGRES_DSN") // now points to CockroachDSN
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	err = db.AutoMigrate(&models.Request{}, &models.RequestTranscript{}, &models.Transcript{})
	if err != nil {
		log.Fatalf("Failed to migrate models: %v", err)
	}

	DB = db
}