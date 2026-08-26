/**
 * Unit tests for Redis Session Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RedisSessionService } from '@/identity/infrastructure/redis-session-service';
import { MemoryKeyStorage } from '@/identity/infrastructure/memory-key-storage';

// Mock Redis Client
class MockRedisClient {
  private data: Map<string, string> = new Map();
  private hashData: Map<string, Map<string, string>> = new Map();
  private setData: Map<string, Set<string>> = new Map();
  private expiryData: Map<string, number> = new Map();

  async set(key: string, value: string, ttl?: number): Promise<void> {
    this.data.set(key, value);
    if (ttl) {
      this.expiryData.set(key, Date.now() + ttl * 1000);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.expiryData.has(key)) {
      const expiry = this.expiryData.get(key)!;
      if (Date.now() > expiry) {
        this.data.delete(key);
        this.expiryData.delete(key);
        return null;
      }
    }
    return this.data.get(key) || null;
  }

  async del(key: string): Promise<number> {
    this.data.delete(key);
    this.hashData.delete(key);
    this.setData.delete(key);
    this.expiryData.delete(key);
    return 1;
  }

  async exists(key: string): Promise<number> {
    if (this.expiryData.has(key)) {
      const expiry = this.expiryData.get(key)!;
      if (Date.now() > expiry) {
        this.data.delete(key);
        this.expiryData.delete(key);
        return 0;
      }
    }
    return (this.data.has(key) || this.hashData.has(key) || this.setData.has(key)) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    this.expiryData.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.hashData.has(key)) {
      this.hashData.set(key, new Map());
    }
    this.hashData.get(key)!.set(field, value);
    return 1;
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (this.expiryData.has(key)) {
      const expiry = this.expiryData.get(key)!;
      if (Date.now() > expiry) {
        this.hashData.delete(key);
        this.expiryData.delete(key);
        return null;
      }
    }
    return this.hashData.get(key)?.get(field) || null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (this.expiryData.has(key)) {
      const expiry = this.expiryData.get(key)!;
      if (Date.now() > expiry) {
        this.hashData.delete(key);
        this.expiryData.delete(key);
        return {};
      }
    }
    const hash = this.hashData.get(key);
    return hash ? Object.fromEntries(hash) : {};
  }

  async hdel(key: string, field: string): Promise<number> {
    const hash = this.hashData.get(key);
    if (hash && hash.has(field)) {
      hash.delete(field);
      return 1;
    }
    return 0;
  }

  async sadd(key: string, member: string): Promise<number> {
    if (!this.setData.has(key)) {
      this.setData.set(key, new Set());
    }
    const set = this.setData.get(key)!;
    const size = set.size;
    set.add(member);
    return set.size - size;
  }

  async srem(key: string, member: string): Promise<number> {
    const set = this.setData.get(key);
    if (set && set.has(member)) {
      set.delete(member);
      return 1;
    }
    return 0;
  }

  async smembers(key: string): Promise<string[]> {
    if (this.expiryData.has(key)) {
      const expiry = this.expiryData.get(key)!;
      if (Date.now() > expiry) {
        this.setData.delete(key);
        this.expiryData.delete(key);
        return [];
      }
    }
    const set = this.setData.get(key);
    return set ? Array.from(set) : [];
  }

  async scard(key: string): Promise<number> {
    if (this.expiryData.has(key)) {
      const expiry = this.expiryData.get(key)!;
      if (Date.now() > expiry) {
        this.setData.delete(key);
        this.expiryData.delete(key);
        return 0;
      }
    }
    return this.setData.get(key)?.size || 0;
  }

  async ping(): Promise<string> {
    return 'PONG';
  }
}

describe('RedisSessionService', () => {
  let sessionService: RedisSessionService;
  let mockRedis: MockRedisClient;

  beforeEach(() => {
    mockRedis = new MockRedisClient();
    sessionService = new RedisSessionService(mockRedis as any);
  });

  describe('createSession', () => {
    it('should create a session for a user', async () => {
      const refreshToken = 'test-refresh-token';
      
      await sessionService.createSession('user-123', refreshToken);
      
      const sessions = await sessionService.getUserSessions('user-123');
      expect(sessions).toHaveLength(1);
    });

    it('should store session metadata', async () => {
      const refreshToken = 'test-refresh-token';
      const metadata = {
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1'
      };
      
      await sessionService.createSession('user-123', refreshToken, metadata);
      
      const sessions = await sessionService.getUserSessions('user-123');
      expect(sessions).toHaveLength(1);
    });
  });

  describe('validateSession', () => {
    it('should validate a valid session', async () => {
      const refreshToken = 'test-refresh-token';
      
      await sessionService.createSession('user-123', refreshToken);
      
      const isValid = await sessionService.validateSession('user-123', refreshToken);
      expect(isValid).toBe(true);
    });

    it('should reject invalid session', async () => {
      const isValid = await sessionService.validateSession('user-123', 'invalid-token');
      expect(isValid).toBe(false);
    });

    it('should reject session for wrong user', async () => {
      const refreshToken = 'test-refresh-token';
      
      await sessionService.createSession('user-123', refreshToken);
      
      const isValid = await sessionService.validateSession('user-456', refreshToken);
      expect(isValid).toBe(false);
    });
  });

  describe('revokeSession', () => {
    it('should revoke a specific session', async () => {
      const refreshToken = 'test-refresh-token';
      
      await sessionService.createSession('user-123', refreshToken);
      await sessionService.revokeSession('user-123', refreshToken);
      
      const isValid = await sessionService.validateSession('user-123', refreshToken);
      expect(isValid).toBe(false);
    });

    it('should remove session from user sessions', async () => {
      const refreshToken = 'test-refresh-token';
      
      await sessionService.createSession('user-123', refreshToken);
      await sessionService.revokeSession('user-123', refreshToken);
      
      const sessions = await sessionService.getUserSessions('user-123');
      expect(sessions).toHaveLength(0);
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should revoke all sessions for a user', async () => {
      await sessionService.createSession('user-123', 'token1');
      await sessionService.createSession('user-123', 'token2');
      await sessionService.createSession('user-123', 'token3');
      
      await sessionService.revokeAllUserSessions('user-123');
      
      const sessions = await sessionService.getUserSessions('user-123');
      expect(sessions).toHaveLength(0);
    });

    it('should not affect other users sessions', async () => {
      await sessionService.createSession('user-123', 'token1');
      await sessionService.createSession('user-456', 'token2');
      
      await sessionService.revokeAllUserSessions('user-123');
      
      const user123Sessions = await sessionService.getUserSessions('user-123');
      const user456Sessions = await sessionService.getUserSessions('user-456');
      
      expect(user123Sessions).toHaveLength(0);
      expect(user456Sessions).toHaveLength(1);
    });
  });

  describe('getUserSessions', () => {
    it('should return empty array for user with no sessions', async () => {
      const sessions = await sessionService.getUserSessions('user-123');
      expect(sessions).toEqual([]);
    });

    it('should return all session IDs for a user', async () => {
      await sessionService.createSession('user-123', 'token1');
      await sessionService.createSession('user-123', 'token2');
      
      const sessions = await sessionService.getUserSessions('user-123');
      expect(sessions).toHaveLength(2);
    });
  });

  describe('token blacklisting', () => {
    it('should blacklist tokens', async () => {
      await sessionService.blacklistToken('refresh', 'token-id', 3600);
      
      const isBlacklisted = await sessionService.isTokenBlacklisted('refresh', 'token-id');
      expect(isBlacklisted).toBe(true);
    });

    it('should not blacklist non-existent tokens', async () => {
      const isBlacklisted = await sessionService.isTokenBlacklisted('refresh', 'non-existent');
      expect(isBlacklisted).toBe(false);
    });
  });
});