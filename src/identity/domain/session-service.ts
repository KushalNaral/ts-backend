/**
 * Domain interface for Session Service
 * Handles Redis-based session management for tokens
 */

export interface SessionData {
  userId: string;
  tokenHash: string;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionService {
  createSession(userId: string, refreshToken: string, metadata?: { userAgent?: string; ipAddress?: string }): Promise<void>;
  validateSession(userId: string, refreshToken: string): Promise<boolean>;
  revokeSession(userId: string, refreshToken: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
  getUserSessions(userId: string): Promise<string[]>;
  addSessionToUser(userId: string, sessionId: string): Promise<void>;
  removeSessionFromUser(userId: string, sessionId: string): Promise<void>;
}