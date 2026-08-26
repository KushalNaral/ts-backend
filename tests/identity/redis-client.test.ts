/**
 * Unit tests for Redis Client implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RedisClientImpl } from '@/identity/infrastructure/redis-client.impl';

describe('RedisClientImpl', () => {
  let redisClient: RedisClientImpl;

  beforeEach(() => {
    // Create a mock Redis client for testing
    redisClient = new RedisClientImpl('redis://localhost:6379');
  });

  afterEach(async () => {
    // Clean up connections
    try {
      await redisClient.disconnect();
    } catch (error) {
      // Ignore disconnect errors in tests
    }
  });

  describe('constructor', () => {
    it('should create a Redis client with default URL', () => {
      const client = new RedisClientImpl();
      expect(client).toBeDefined();
    });

    it('should create a Redis client with custom URL', () => {
      const client = new RedisClientImpl('redis://custom-host:6380');
      expect(client).toBeDefined();
    });
  });

  describe('connection', () => {
    it('should connect to Redis server', async () => {
      // This test would require a running Redis instance
      // For now, we'll test the interface
      expect(redisClient.connect).toBeDefined();
      expect(typeof redisClient.connect).toBe('function');
    });

    it('should disconnect from Redis server', async () => {
      expect(redisClient.disconnect).toBeDefined();
      expect(typeof redisClient.disconnect).toBe('function');
    });
  });

  describe('basic operations', () => {
    it('should have set method', () => {
      expect(redisClient.set).toBeDefined();
      expect(typeof redisClient.set).toBe('function');
    });

    it('should have get method', () => {
      expect(redisClient.get).toBeDefined();
      expect(typeof redisClient.get).toBe('function');
    });

    it('should have del method', () => {
      expect(redisClient.del).toBeDefined();
      expect(typeof redisClient.del).toBe('function');
    });

    it('should have exists method', () => {
      expect(redisClient.exists).toBeDefined();
      expect(typeof redisClient.exists).toBe('function');
    });

    it('should have expire method', () => {
      expect(redisClient.expire).toBeDefined();
      expect(typeof redisClient.expire).toBe('function');
    });
  });

  describe('hash operations', () => {
    it('should have hset method', () => {
      expect(redisClient.hset).toBeDefined();
      expect(typeof redisClient.hset).toBe('function');
    });

    it('should have hget method', () => {
      expect(redisClient.hget).toBeDefined();
      expect(typeof redisClient.hget).toBe('function');
    });

    it('should have hgetall method', () => {
      expect(redisClient.hgetall).toBeDefined();
      expect(typeof redisClient.hgetall).toBe('function');
    });

    it('should have hdel method', () => {
      expect(redisClient.hdel).toBeDefined();
      expect(typeof redisClient.hdel).toBe('function');
    });
  });

  describe('set operations', () => {
    it('should have sadd method', () => {
      expect(redisClient.sadd).toBeDefined();
      expect(typeof redisClient.sadd).toBe('function');
    });

    it('should have srem method', () => {
      expect(redisClient.srem).toBeDefined();
      expect(typeof redisClient.srem).toBe('function');
    });

    it('should have smembers method', () => {
      expect(redisClient.smembers).toBeDefined();
      expect(typeof redisClient.smembers).toBe('function');
    });

    it('should have scard method', () => {
      expect(redisClient.scard).toBeDefined();
      expect(typeof redisClient.scard).toBe('function');
    });
  });

  describe('utility operations', () => {
    it('should have ping method', () => {
      expect(redisClient.ping).toBeDefined();
      expect(typeof redisClient.ping).toBe('function');
    });
  });
});