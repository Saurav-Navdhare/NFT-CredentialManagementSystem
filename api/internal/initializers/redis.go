package initializers

import (
	"context"
	"fmt"
	"github.com/redis/go-redis/v9"
	"log"
	"os"
)

var RedisClient *redis.Client

func InitRedis() {
	RedisUri := os.Getenv("REDIS_URI")

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
