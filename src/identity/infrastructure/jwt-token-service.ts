/**
 * JWT Token Service implementation
 * Generates and validates JWT tokens using RSA keys from secure storage
 */

import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'crypto';
import type { TokenService, TokenPayload, TokenPair } from '@/identity/domain/token-service';
import type { JWKSProvider } from '@/identity/domain/jwks-provider';
import type { SecureKeyStorage } from '@/identity/domain/secure-key-storage';
import { env } from '@/config/env';

export class JWTTokenService implements TokenService {
  constructor(
    private readonly jwksProvider: JWKSProvider,
    private readonly secureKeyStorage: SecureKeyStorage
  ) {}

  async generateAccessToken(userId: string, email: string, role: string): Promise<string> {
    const jti = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.parseTimeToSeconds(env.JWT_ACCESS_TOKEN_EXPIRY);
    
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
      iat: now,
      exp: now + expiresIn,
      jti,
    };

    // Get active key for signing
    const activeKey = await this.jwksProvider.getActiveKey();
    if (!activeKey) {
      throw new Error('No active key available for signing');
    }

    // Get private key from secure storage
    const privateKey = await this.secureKeyStorage.getPrivateKey(activeKey.kid);
    if (!privateKey) {
      throw new Error('Private key not found in secure storage');
    }

    const privateKeyJWK = JSON.parse(privateKey);
    
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ 
        alg: activeKey.alg,
        kid: activeKey.kid,
        typ: 'JWT'
      })
      .setIssuedAt(now)
      .setExpirationTime(now + expiresIn)
      .setJti(jti)
      .sign(privateKeyJWK);

    return token;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    // Generate a random refresh token
    const refreshToken = randomUUID() + randomUUID() + randomUUID();
    return refreshToken;
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      // Get JWKS for verification
      const jwks = await this.jwksProvider.getJWKS();
      
      // Create a simple JWKS function for verification
      const jwksFunction = async (header: any) => {
        const key = jwks.keys.find(k => k.kid === header.kid);
        if (!key) {
          throw new Error('Key not found');
        }
        // Convert JWK to key format
        const { importJWK } = await import('jose');
        return await importJWK(key, header.alg);
      };

      const { payload } = await jwtVerify(token, jwksFunction);
      
      // Type assertion with validation
      if (
        typeof payload.sub === 'string' &&
        typeof payload.email === 'string' &&
        typeof payload.role === 'string' &&
        typeof payload.iat === 'number' &&
        typeof payload.exp === 'number' &&
        typeof payload.jti === 'string'
      ) {
        return {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          iat: payload.iat,
          exp: payload.exp,
          jti: payload.jti,
        };
      }
      
      throw new Error('Invalid token payload structure');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(userId, email, role);
    const refreshToken = await this.generateRefreshToken(userId);
    const expiresIn = this.parseTimeToSeconds(env.JWT_ACCESS_TOKEN_EXPIRY || '15m');

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseTimeToSeconds(timeString: string | undefined): number {
    if (!timeString) {
      return 900; // Default 15 minutes
    }

    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const value = parseInt(match[1] || '15', 10);
    const unit = match[2] || 'm';

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
    }
  }
}