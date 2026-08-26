/**
 * Integration tests for Key Management
 * Tests the complete flow from key generation to JWKS provisioning
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RSAKeyGenerator } from '@/identity/infrastructure/rsa-key-generator';
import { MemoryKeyStorage } from '@/identity/infrastructure/memory-key-storage';
import { JWKSProviderImpl } from '@/identity/infrastructure/jwks-provider.impl';
import type { JWTKeyRepository } from '@/identity/repository/jwt-key.repository';
import type { SecureKeyStorage } from '@/identity/domain/secure-key-storage';

// Mock repository for testing
class MockJWTKeyRepository implements JWTKeyRepository {
  private keys: Array<{
    id: string;
    keyId: string;
    publicKey: string;
    algorithm: string;
    status: "active" | "deprecated" | "revoked";
    activatedAt: Date | null;
    expiresAt: Date | null;
    deprecatedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  async findById(id: string) {
    return this.keys.find(k => k.id === id) || null;
  }

  async findByKeyId(keyId: string) {
    return this.keys.find(k => k.keyId === keyId) || null;
  }

  async findActiveKeys() {
    return this.keys.filter(k => k.status === 'active').sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async create(data: any) {
    const newKey = {
      id: crypto.randomUUID(),
      ...data,
      status: 'active' as const,
      activatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.keys.push(newKey);
    return newKey;
  }

  async activateKey(keyId: string) {
    const key = this.keys.find(k => k.keyId === keyId);
    if (key) {
      key.status = 'active';
      key.activatedAt = new Date();
      key.updatedAt = new Date();
    }
    return key || null;
  }

  async deactivateKey(keyId: string) {
    const key = this.keys.find(k => k.keyId === keyId);
    if (key) {
      key.status = 'deprecated';
      key.deprecatedAt = new Date();
      key.updatedAt = new Date();
    }
    return key || null;
  }

  async revokeKey(keyId: string) {
    const key = this.keys.find(k => k.keyId === keyId);
    if (key) {
      key.status = 'revoked';
      key.updatedAt = new Date();
    }
    return key || null;
  }

  async delete(keyId: string) {
    const index = this.keys.findIndex(k => k.keyId === keyId);
    if (index >= 0) {
      this.keys.splice(index, 1);
      return true;
    }
    return false;
  }

  clear() {
    this.keys = [];
  }
}

describe('Key Management Integration', () => {
  let keyGenerator: RSAKeyGenerator;
  let secureKeyStorage: SecureKeyStorage;
  let mockRepository: MockJWTKeyRepository;
  let jwksProvider: JWKSProviderImpl;

  beforeEach(() => {
    secureKeyStorage = new MemoryKeyStorage();
    keyGenerator = new RSAKeyGenerator('RS256', 2048, secureKeyStorage);
    mockRepository = new MockJWTKeyRepository();
    jwksProvider = new JWKSProviderImpl(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
    (secureKeyStorage as MemoryKeyStorage).clear();
  });

  describe('Complete Key Lifecycle', () => {
    it('should generate key, store in database, and provide via JWKS', async () => {
      // Step 1: Generate key pair
      const keyPair = await keyGenerator.generateKeyPair();
      
      expect(keyPair.keyId).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      
      // Step 2: Store key metadata in database
      await mockRepository.create({
        keyId: keyPair.keyId,
        publicKey: keyPair.publicKey,
        algorithm: 'RS256',
      });
      
      // Step 3: Verify private key is stored securely
      const hasPrivateKey = await secureKeyStorage.hasPrivateKey(keyPair.keyId);
      expect(hasPrivateKey).toBe(true);
      
      // Step 4: Retrieve via JWKS
      const jwks = await jwksProvider.getJWKS();
      expect(jwks.keys).toHaveLength(1);
      expect(jwks.keys[0].kid).toBe(keyPair.keyId);
    });

    it('should handle key rotation gracefully', async () => {
      // Generate first key
      const keyPair1 = await keyGenerator.generateKeyPair();
      await mockRepository.create({
        keyId: keyPair1.keyId,
        publicKey: keyPair1.publicKey,
        algorithm: 'RS256',
      });

      // Generate second key
      const keyPair2 = await keyGenerator.generateKeyPair();
      await mockRepository.create({
        keyId: keyPair2.keyId,
        publicKey: keyPair2.publicKey,
        algorithm: 'RS256',
      });

      // Deactivate first key
      await mockRepository.deactivateKey(keyPair1.keyId);

      // JWKS should only show active key
      const jwks = await jwksProvider.getJWKS();
      expect(jwks.keys).toHaveLength(1);
      expect(jwks.keys[0].kid).toBe(keyPair2.keyId);
    });

    it('should handle key revocation', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      await mockRepository.create({
        keyId: keyPair.keyId,
        publicKey: keyPair.publicKey,
        algorithm: 'RS256',
      });

      // Revoke the key
      await mockRepository.revokeKey(keyPair.keyId);

      // JWKS should not show revoked key
      const jwks = await jwksProvider.getJWKS();
      expect(jwks.keys).toHaveLength(0);
    });
  });

  describe('Multi-Algorithm Support', () => {
    it('should support different algorithms', async () => {
      const algorithms = ['RS256', 'RS384', 'RS512'] as const;
      
      for (const algorithm of algorithms) {
        const generator = new RSAKeyGenerator(algorithm, 2048, secureKeyStorage);
        const keyPair = await generator.generateKeyPair();
        
        await mockRepository.create({
          keyId: keyPair.keyId,
          publicKey: keyPair.publicKey,
          algorithm,
        });
      }

      const jwks = await jwksProvider.getJWKS();
      expect(jwks.keys).toHaveLength(3);
      
      const algValues = jwks.keys.map(k => k.alg);
      expect(algValues).toContain('RS256');
      expect(algValues).toContain('RS384');
      expect(algValues).toContain('RS512');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing keys gracefully', async () => {
      const jwk = await jwksProvider.getKeyById('non-existent-key');
      expect(jwk).toBeNull();
    });

    it('should handle empty JWKS when no keys exist', async () => {
      const jwks = await jwksProvider.getJWKS();
      expect(jwks.keys).toHaveLength(0);
    });

    it('should handle null active key when no keys exist', async () => {
      const activeKey = await jwksProvider.getActiveKey();
      expect(activeKey).toBeNull();
    });
  });

  describe('Key Storage Security', () => {
    it('should never return private keys from database operations', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      
      const dbKey = await mockRepository.create({
        keyId: keyPair.keyId,
        publicKey: keyPair.publicKey,
        algorithm: 'RS256',
      });

      // Database should not have private key
      expect(dbKey).not.toHaveProperty('privateKey');
      expect(dbKey).not.toHaveProperty('privateKeyEncrypted');
    });

    it('should store private key separately from database', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      
      await mockRepository.create({
        keyId: keyPair.keyId,
        publicKey: keyPair.publicKey,
        algorithm: 'RS256',
      });

      // Private key should be in secure storage
      const privateKey = await secureKeyStorage.getPrivateKey(keyPair.keyId);
      expect(privateKey).toBeDefined();
      expect(privateKey).not.toBe('');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent key generation', async () => {
      const keyPromises = Array.from({ length: 5 }, () => keyGenerator.generateKeyPair());
      const keyPairs = await Promise.all(keyPromises);

      expect(keyPairs).toHaveLength(5);
      const keyIds = keyPairs.map(k => k.keyId);
      const uniqueKeyIds = new Set(keyIds);
      expect(uniqueKeyIds.size).toBe(5); // All key IDs should be unique
    });

    it('should handle concurrent JWKS requests', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      await mockRepository.create({
        keyId: keyPair.keyId,
        publicKey: keyPair.publicKey,
        algorithm: 'RS256',
      });

      const jwksPromises = Array.from({ length: 10 }, () => jwksProvider.getJWKS());
      const jwksResults = await Promise.all(jwksPromises);

      // All requests should return the same result
      jwksResults.forEach(jwks => {
        expect(jwks.keys).toHaveLength(1);
        expect(jwks.keys[0].kid).toBe(keyPair.keyId);
      });
    });
  });
});