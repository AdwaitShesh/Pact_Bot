import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      automaticDeserialization: false
    });

    // Test the connection
    redis.ping().then(() => {
      console.log('Redis connected successfully');
    }).catch((error) => {
      console.warn('Redis connection warning:', error);
      redis = null; // Disable Redis if connection fails
    });
  } else {
    console.warn('Redis configuration missing - caching disabled');
  }
} catch (error) {
  console.warn('Redis initialization failed:', error);
  redis = null;
}

// Helper function to safely execute Redis operations
export const safeRedisOperation = async <T>(operation: () => Promise<T>): Promise<T | null> => {
  if (!redis) return null;
  try {
    return await operation();
  } catch (error) {
    console.warn('Redis operation failed:', error);
    return null;
  }
};

export default redis;
