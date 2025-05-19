package initializers

import (
	"context"
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis() {
	RedisUri := os.Getenv("REDIS_URI")
	fmt.Println("Redis URI:", RedisUri)
	opt, err := redis.ParseURL(RedisUri)
	if err != nil {
		log.Fatalf("Failed to parse Redis URI: %v", err)
	}

	RedisClient = redis.NewClient(opt)

	_, err = RedisClient.Ping(context.Background()).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	} else {
		fmt.Println("Successfully connected to Redis")
	}
}

func LoadEnvVars() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
	fmt.Println("Environment variables loaded successfully")
}
