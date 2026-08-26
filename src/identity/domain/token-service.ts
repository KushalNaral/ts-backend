/**
 * Domain interface for Token Service
 * Handles JWT token generation and validation
 */

export interface TokenPayload {
  sub: string;      // User ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;     // JWT ID for revocation
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenService {
  generateAccessToken(userId: string, email: string, role: string): Promise<string>;
  generateRefreshToken(userId: string): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
  generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair>;
}