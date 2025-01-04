package initializers

import (
	"context"
	"fmt"
	"github.com/redis/go-redis/v9"
	"log"
	"os"
)

var RDB *redis.Client

func InitRedis() {
	address := os.Getenv("REDIS_ADDRESS")
	password := os.Getenv("REDIS_PASSWORD")
	fmt.Printf("Connecting to Redis at %s\n password: %s\n", address, password)
	RDB = redis.NewClient(&redis.Options{
		Addr:     address,
		Password: password,
		DB:       0, // use default DB
	})

	_, err := RDB.Ping(context.Background()).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	} else {
		fmt.Println("Successfully connected to Redis")
	}
}
