package utils

import (
	"api/initializers"
	"context"
	"errors"
	"fmt"
	"github.com/redis/go-redis/v9"
	"time"
)

func StoreInRedis(key, value string) error {
	var ctx = context.Background()
	cmd := initializers.RDB.Set(ctx, key, value, 5*time.Minute)
	if cmd.Err() != nil {
		return fmt.Errorf("failed to store in Redis: %v", cmd.Err())
	}
	return nil
}

func RetrieveFromRedis(key string) (string, error) {
	// retrieve from redis
	var ctx = context.Background()
	value, err := initializers.RDB.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", fmt.Errorf("key does not exist")
	} else if err != nil {
		return "", fmt.Errorf("failed to retrieve value: %v", err)
	}
	return value, nil
}

func DeleteFromRedis(key string) error {
	var ctx = context.Background()
	cmd := initializers.RDB.Del(ctx, key)
	if cmd.Err() != nil {
		return fmt.Errorf("failed to delete from Redis: %v", cmd.Err())
	}
	return nil
}
