/**
 * Redis client implementation using the node-redis library
 * Provides a wrapper around Redis operations for token management
 */

import { createClient, type RedisClientType } from 'redis';
import type { RedisClient } from '@/identity/domain/redis-client';

export class RedisClientImpl implements RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(url: string = 'redis://localhost:6379') {
    this.client = createClient({
      url,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.client.expire(key, seconds);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hGet(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hGetAll(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.client.hDel(key, field);
  }

  async sadd(key: string, member: string): Promise<number> {
    return await this.client.sAdd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    return await this.client.sRem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.sMembers(key);
  }

  async scard(key: string): Promise<number> {
    return await this.client.sCard(key);
  }

  async ping(): Promise<string> {
    return await this.client.ping();
  }
}