package utils

import (
	"api/internal/initializers"
	"context"
	"time"
)

func StoreInRedis(key, value string, minutes int) error {
	var ctx = context.Background()
	cmd := initializers.RedisClient.Set(ctx, key, value, time.Duration(minutes)*time.Minute)
	return cmd.Err()
}

func RetrieveFromRedis(key string) (string, error) {
	// retrieve from redis
	var ctx = context.Background()
	value, err := initializers.RedisClient.Get(ctx, key).Result()
	if err != nil {
		return "", err
	}
	return value, nil
}

func DeleteFromRedis(key string) error {
	var ctx = context.Background()
	cmd := initializers.RedisClient.Del(ctx, key)
	return cmd.Err()
}
