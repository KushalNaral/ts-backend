/**
 * JWKS Provider implementation
 * Provides public keys in JWKS format for JWT verification
 * Only works with public keys stored in database - private keys are stored separately
 */

import type { JWKSProvider, JWK, JWKSResponse } from '@/identity/domain/jwks-provider';
import type { JWTKeyRepository } from '@/identity/repository/jwt-key.repository';
import { importJWK } from 'jose';

export class JWKSProviderImpl implements JWKSProvider {
  constructor(private readonly jwtKeyRepository: JWTKeyRepository) {}

  async getJWKS(): Promise<JWKSResponse> {
    const activeKeys = await this.jwtKeyRepository.findActiveKeys();
    
    const keys: JWK[] = [];
    
    for (const key of activeKeys) {
      const jwk = await this.convertToJWK(key);
      if (jwk) {
        keys.push(jwk);
      }
    }

    return { keys };
  }

  async getKeyById(keyId: string): Promise<JWK | null> {
    const key = await this.jwtKeyRepository.findByKeyId(keyId);
    
    if (!key) {
      return null;
    }

    return await this.convertToJWK(key);
  }

  async getActiveKey(): Promise<JWK | null> {
    const activeKeys = await this.jwtKeyRepository.findActiveKeys();
    
    if (activeKeys.length === 0) {
      return null;
    }

    // Return the most recently created active key
    const latestKey = activeKeys[0];
    if (!latestKey) {
      return null;
    }
    
    return await this.convertToJWK(latestKey);
  }

  private async convertToJWK(key: { publicKey: string; keyId: string; algorithm: string }): Promise<JWK | null> {
    try {
      const publicKeyJWK = JSON.parse(key.publicKey);
      
      // Add algorithm to JWK if not present
      if (!publicKeyJWK.alg) {
        publicKeyJWK.alg = key.algorithm;
      }
      
      const publicKey = await importJWK(publicKeyJWK, key.algorithm);
      const exported = await importJWK(publicKeyJWK, key.algorithm);
      
      // Convert to JWKS format
      const jwk: JWK = {
        kty: 'RSA',
        kid: key.keyId,
        use: 'sig',
        alg: key.algorithm,
        n: (exported as any).n || '',
        e: (exported as any).e || '',
      };

      return jwk;
    } catch (error) {
      console.error('Error converting key to JWK:', error);
      return null;
    }
  }
}