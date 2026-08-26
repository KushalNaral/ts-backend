/**
 * Redis Session Service implementation
 * Manages sessions using Redis for fast token validation and revocation
 */

import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import type { SessionService, SessionData } from '@/identity/domain/session-service';
import type { RedisClient } from '@/identity/domain/redis-client';
import { env } from '@/config/env';

export class RedisSessionService implements SessionService {
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly BLACKLIST_PREFIX = 'blacklist:';
  
  constructor(private readonly redisClient: RedisClient) {}

  async createSession(userId: string, refreshToken: string, metadata?: { userAgent?: string; ipAddress?: string }): Promise<void> {
    const sessionId = randomUUID();
    const tokenHash = this.hashToken(refreshToken);
    const now = new Date();
    const refreshExpirySeconds = this.parseTimeToSeconds(env.JWT_REFRESH_TOKEN_EXPIRY || '7d');
    
    const sessionData: SessionData = {
      userId,
      tokenHash,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      expiresAt: new Date(now.getTime() + refreshExpirySeconds * 1000),
      createdAt: now,
    };

    // Store session data
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
    await this.redisClient.hset(sessionKey, 'userId', sessionData.userId);
    await this.redisClient.hset(sessionKey, 'tokenHash', sessionData.tokenHash);
    await this.redisClient.hset(sessionKey, 'userAgent', sessionData.userAgent || '');
    await this.redisClient.hset(sessionKey, 'ipAddress', sessionData.ipAddress || '');
    await this.redisClient.hset(sessionKey, 'expiresAt', sessionData.expiresAt.toISOString());
    await this.redisClient.hset(sessionKey, 'createdAt', sessionData.createdAt.toISOString());
    await this.redisClient.expire(sessionKey, refreshExpirySeconds);

    // Add to user's sessions
    await this.addSessionToUser(userId, sessionId);
  }

  async validateSession(userId: string, refreshToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(refreshToken);
    
    // Get user's sessions
    const sessionIds = await this.getUserSessions(userId);
    
    for (const sessionId of sessionIds) {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const exists = await this.redisClient.exists(sessionKey);
      
      if (exists) {
        const storedHash = await this.redisClient.hget(sessionKey, 'tokenHash');
        if (storedHash === tokenHash) {
          // Check if expired
          const expiresAtStr = await this.redisClient.hget(sessionKey, 'expiresAt');
          if (expiresAtStr) {
            const expiresAt = new Date(expiresAtStr);
            if (expiresAt > new Date()) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }

  async revokeSession(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    
    // Find and remove the session
    const sessionIds = await this.getUserSessions(userId);
    
    for (const sessionId of sessionIds) {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const storedHash = await this.redisClient.hget(sessionKey, 'tokenHash');
      
      if (storedHash === tokenHash) {
        await this.redisClient.del(sessionKey);
        await this.removeSessionFromUser(userId, sessionId);
        
        // Add to blacklist
        const blacklistKey = `${this.BLACKLIST_PREFIX}refresh:${sessionId}`;
        await this.redisClient.set(blacklistKey, 'revoked');
        await this.redisClient.expire(blacklistKey, this.parseTimeToSeconds(env.JWT_REFRESH_TOKEN_EXPIRY || '7d'));
        
        break;
      }
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessionIds = await this.getUserSessions(userId);
    
    for (const sessionId of sessionIds) {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      await this.redisClient.del(sessionKey);
      
      // Add to blacklist
      const blacklistKey = `${this.BLACKLIST_PREFIX}refresh:${sessionId}`;
      await this.redisClient.set(blacklistKey, 'revoked');
      await this.redisClient.expire(blacklistKey, this.parseTimeToSeconds(env.JWT_REFRESH_TOKEN_EXPIRY || '7d'));
    }
    
    // Clear user's sessions
    await this.redisClient.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
  }

  async getUserSessions(userId: string): Promise<string[]> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    return await this.redisClient.smembers(userSessionsKey);
  }

  async addSessionToUser(userId: string, sessionId: string): Promise<void> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    await this.redisClient.sadd(userSessionsKey, sessionId);
    
    // Set expiry on user sessions set
    await this.redisClient.expire(userSessionsKey, this.parseTimeToSeconds(env.JWT_REFRESH_TOKEN_EXPIRY || '7d') * 2);
  }

  async removeSessionFromUser(userId: string, sessionId: string): Promise<void> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
    await this.redisClient.srem(userSessionsKey, sessionId);
  }

  async isTokenBlacklisted(tokenType: 'refresh' | 'access', tokenId: string): Promise<boolean> {
    const blacklistKey = `${this.BLACKLIST_PREFIX}${tokenType}:${tokenId}`;
    return (await this.redisClient.exists(blacklistKey)) > 0;
  }

  async blacklistToken(tokenType: 'refresh' | 'access', tokenId: string, ttl?: number): Promise<void> {
    const blacklistKey = `${this.BLACKLIST_PREFIX}${tokenType}:${tokenId}`;
    await this.redisClient.set(blacklistKey, 'revoked');
    
    if (ttl) {
      await this.redisClient.expire(blacklistKey, ttl);
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseTimeToSeconds(timeString: string): number {
    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 604800; // Default 7 days
    }

    const value = parseInt(match[1] || '7', 10);
    const unit = match[2] || 'd';

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 604800;
    }
  }
}