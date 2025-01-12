package utils

import (
	"api/internal/initializers"
	"context"
	"time"
)

func StoreInRedis(key, value string) error {
	var ctx = context.Background()
	cmd := initializers.RDB.Set(ctx, key, value, 5*time.Minute)
	return cmd.Err()
}

func RetrieveFromRedis(key string) (string, error) {
	// retrieve from redis
	var ctx = context.Background()
	value, err := initializers.RDB.Get(ctx, key).Result()
	if err != nil {
		return "", err
	}
	return value, nil
}

func DeleteFromRedis(key string) error {
	var ctx = context.Background()
	cmd := initializers.RDB.Del(ctx, key)
	return cmd.Err()
}
