/**
 * Key Initialization Service
 * Ensures there's always an active key available for token signing
 */

import { RSAKeyGenerator } from '@/identity/infrastructure/rsa-key-generator';
import type { JWTKeyRepository } from '@/identity/repository/jwt-key.repository';
import type { SecureKeyStorage } from '@/identity/domain/secure-key-storage';

export class KeyInitializer {
  constructor(
    private readonly keyGenerator: RSAKeyGenerator,
    private readonly jwtKeyRepository: JWTKeyRepository,
    private readonly secureKeyStorage: SecureKeyStorage
  ) {}

  async initializeKeys(): Promise<void> {
    // Check if there are any active keys
    const activeKeys = await this.jwtKeyRepository.findActiveKeys();
    
    if (activeKeys.length === 0) {
      console.log('No active keys found, generating initial key...');
      await this.generateInitialKey();
    } else {
      console.log(`Found ${activeKeys.length} active key(s)`);
    }
  }

  private async generateInitialKey(): Promise<void> {
    const keyPair = await this.keyGenerator.generateKeyPair();
    
    await this.jwtKeyRepository.create({
      keyId: keyPair.keyId,
      publicKey: keyPair.publicKey,
      algorithm: keyPair.algorithm as "RS256" | "RS384" | "RS512",
    });
    
    console.log(`Generated initial key: ${keyPair.keyId}`);
  }
}