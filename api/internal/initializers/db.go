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
	dsn := os.Getenv("POSTGRES_DSN")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	// Auto-migrate the Request model
	err = db.AutoMigrate(&models.Request{})
	if err != nil {
		log.Fatalf("Failed to migrate models: %v", err)
	}

	DB = db
}
