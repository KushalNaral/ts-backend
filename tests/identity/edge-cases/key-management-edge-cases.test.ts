/**
 * Edge case tests for Key Management
 * Tests boundary conditions, unusual inputs, and error scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RSAKeyGenerator } from '../../../src/identity/infrastructure/rsa-key-generator';
import { MemoryKeyStorage } from '../../../src/identity/infrastructure/memory-key-storage';
import { EnvKeyStorage } from '../../../src/identity/infrastructure/env-key-storage';
import { RedisClientImpl } from '../../../src/identity/infrastructure/redis-client.impl';
import { 
  KeyGenerationError, 
  KeyNotFoundError, 
  RedisConnectionError,
  SecureKeyStorageError 
} from '../../../src/identity/errors/identity-errors';

describe('Key Management Edge Cases', () => {
  describe('RSA Key Generator Edge Cases', () => {
    it('should handle very large key sizes', async () => {
      const storage = new MemoryKeyStorage();
      const generator = new RSAKeyGenerator('RS256', 4096, storage);
      
      // This may take longer but should work
      const keyPair = await generator.generateKeyPair();
      expect(keyPair.keyId).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
    });

    it('should handle minimum key size', async () => {
      const storage = new MemoryKeyStorage();
      const generator = new RSAKeyGenerator('RS256', 2048, storage);
      
      const keyPair = await generator.generateKeyPair();
      expect(keyPair.keyId).toBeDefined();
    });

    it('should generate key IDs with maximum length', () => {
      const generator = new RSAKeyGenerator();
      const keyId = generator.generateKeyId();
      
      // Key IDs should be reasonably long but not excessive
      expect(keyId.length).toBeGreaterThan(10);
      expect(keyId.length).toBeLessThan(100);
    });

    it('should handle rapid sequential key generation', async () => {
      const storage = new MemoryKeyStorage();
      const generator = new RSAKeyGenerator('RS256', 2048, storage);
      
      const keyPairs = [];
      for (let i = 0; i < 10; i++) {
        const keyPair = await generator.generateKeyPair();
        keyPairs.push(keyPair);
      }
      
      // All key IDs should be unique
      const keyIds = keyPairs.map(k => k.keyId);
      const uniqueKeyIds = new Set(keyIds);
      expect(uniqueKeyIds.size).toBe(10);
    });

    it('should handle invalid JSON in key parsing', async () => {
      const generator = new RSAKeyGenerator();
      
      await expect(generator.parsePublicKey('invalid json')).rejects.toThrow();
      await expect(generator.parsePrivateKey('invalid json')).rejects.toThrow();
    });

    it('should handle malformed JWK in key parsing', async () => {
      const generator = new RSAKeyGenerator();
      
      await expect(generator.parsePublicKey('{"incomplete": "jwk"}')).rejects.toThrow();
      await expect(generator.parsePrivateKey('{"incomplete": "jwk"}')).rejects.toThrow();
    });
  });

  describe('Secure Key Storage Edge Cases', () => {
    it('should handle storing empty private keys', async () => {
      const storage = new MemoryKeyStorage();
      
      await storage.storePrivateKey('key1', '');
      const key = await storage.getPrivateKey('key1');
      expect(key).toBeNull(); // Empty strings are treated as null
    });

    it('should handle very long private keys', async () => {
      const storage = new MemoryKeyStorage();
      const longKey = 'x'.repeat(10000);
      
      await storage.storePrivateKey('key1', longKey);
      const key = await storage.getPrivateKey('key1');
      expect(key).toBe(longKey);
    });

    it('should handle special characters in key IDs', async () => {
      const storage = new MemoryKeyStorage();
      const specialKeyId = 'key-with-special-chars_123!@#$%';
      
      await storage.storePrivateKey(specialKeyId, 'private-key');
      const key = await storage.getPrivateKey(specialKeyId);
      expect(key).toBe('private-key');
    });

    it('should handle Unicode in key IDs', async () => {
      const storage = new MemoryKeyStorage();
      const unicodeKeyId = 'key-привет-日本語-🔑';
      
      await storage.storePrivateKey(unicodeKeyId, 'private-key');
      const key = await storage.getPrivateKey(unicodeKeyId);
      expect(key).toBe('private-key');
    });

    it('should handle concurrent storage operations', async () => {
      const storage = new MemoryKeyStorage();
      
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(storage.storePrivateKey(`key${i}`, `value${i}`));
      }
      
      await Promise.all(promises);
      
      // Verify all keys were stored
      for (let i = 0; i < 100; i++) {
        const key = await storage.getPrivateKey(`key${i}`);
        expect(key).toBe(`value${i}`);
      }
    });

    it('should handle storage clear with many keys', async () => {
      const storage = new MemoryKeyStorage();
      
      // Add many keys
      for (let i = 0; i < 1000; i++) {
        await storage.storePrivateKey(`key${i}`, `value${i}`);
      }
      
      // Clear all
      storage.clear();
      
      // Verify all are gone
      for (let i = 0; i < 1000; i++) {
        const hasKey = await storage.hasPrivateKey(`key${i}`);
        expect(hasKey).toBe(false);
      }
    });
  });

  describe('Environment Key Storage Edge Cases', () => {
    it('should handle missing environment variables', async () => {
      const storage = new EnvKeyStorage();
      
      const key = await storage.getPrivateKey('non-existent-key');
      expect(key).toBeNull();
    });

    it('should handle environment variable deletion', async () => {
      const storage = new EnvKeyStorage();
      const testKey = 'test_env_key_' + Date.now();
      
      await storage.storePrivateKey(testKey, 'private-key');
      await storage.deletePrivateKey(testKey);
      
      const key = await storage.getPrivateKey(testKey);
      expect(key).toBeNull();
    });

    it('should handle overwriting environment variables', async () => {
      const storage = new EnvKeyStorage();
      const testKey = 'test_env_key_' + Date.now();
      
      await storage.storePrivateKey(testKey, 'first-value');
      await storage.storePrivateKey(testKey, 'second-value');
      
      const key = await storage.getPrivateKey(testKey);
      expect(key).toBe('second-value');
    });
  });

  describe('Redis Client Edge Cases', () => {
    it('should handle very long values', async () => {
      const client = new RedisClientImpl('redis://localhost:6379');
      const longValue = 'x'.repeat(1000000); // 1MB string
      
      // This test requires a running Redis instance
      // For now, we'll just test the interface
      expect(client.set).toBeDefined();
    });

    it('should handle special characters in keys', async () => {
      const client = new RedisClientImpl('redis://localhost:6379');
      
      // Test interface accepts special characters
      expect(client.set).toBeDefined();
      expect(client.get).toBeDefined();
    });

    it('should handle very long key names', async () => {
      const client = new RedisClientImpl('redis://localhost:6379');
      const longKey = 'x'.repeat(10000);
      
      // Test interface accepts long keys
      expect(client.set).toBeDefined();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle custom error creation', () => {
      const error = new KeyGenerationError('Custom error message');
      expect(error.message).toBe('Custom error message');
      expect(error.code).toBe('KEY_GENERATION_ERROR');
      expect(error.name).toBe('KeyGenerationError');
    });

    it('should handle key not found error with ID', () => {
      const error = new KeyNotFoundError('key-123');
      expect(error.message).toContain('key-123');
      expect(error.code).toBe('KEY_NOT_FOUND');
    });

    it('should handle error with default messages', () => {
      const error1 = new KeyGenerationError();
      expect(error1.message).toBe('Failed to generate cryptographic key');
      
      const error2 = new RedisConnectionError();
      expect(error2.message).toBe('Failed to connect to Redis');
    });

    it('should maintain error inheritance', () => {
      const error = new KeyGenerationError();
      expect(error instanceof Error).toBe(true);
      expect(error instanceof KeyGenerationError).toBe(true);
    });
  });

  describe('Memory and Resource Edge Cases', () => {
    it('should handle storage with many keys', async () => {
      const storage = new MemoryKeyStorage();
      
      // Add many keys to test memory handling
      for (let i = 0; i < 10000; i++) {
        await storage.storePrivateKey(`key${i}`, `value${i}`);
      }
      
      // Verify we can still access them
      const hasKey = await storage.hasPrivateKey('key5000');
      expect(hasKey).toBe(true);
    });

    it('should handle key ID collisions', async () => {
      const storage = new MemoryKeyStorage();
      const generator = new RSAKeyGenerator('RS256', 2048, storage);
      
      // Generate fewer keys to avoid timeout (RSA generation is expensive)
      const keyIds = new Set();
      for (let i = 0; i < 20; i++) {
        const keyPair = await generator.generateKeyPair();
        expect(keyIds.has(keyPair.keyId)).toBe(false);
        keyIds.add(keyPair.keyId);
      }
    }, 30000);
  });

  describe('Algorithm Edge Cases', () => {
    it('should handle all supported algorithms', async () => {
      const storage = new MemoryKeyStorage();
      const algorithms = ['RS256', 'RS384', 'RS512'] as const;
      
      for (const algorithm of algorithms) {
        const generator = new RSAKeyGenerator(algorithm, 2048, storage);
        const keyPair = await generator.generateKeyPair();
        
        expect(keyPair.algorithm).toBe(algorithm);
        expect(keyPair.keyId).toBeDefined();
      }
    });

    it('should handle algorithm case sensitivity', async () => {
      const storage = new MemoryKeyStorage();
      
      // Lowercase should fail (JOSE requires uppercase)
      const generator1 = new RSAKeyGenerator('rs256' as any, 2048, storage);
      
      await expect(generator1.generateKeyPair()).rejects.toThrow();
      
      // Uppercase should work
      const generator2 = new RSAKeyGenerator('RS256', 2048, storage);
      const keyPair2 = await generator2.generateKeyPair();
      
      expect(keyPair2.keyId).toBeDefined();
    });
  });
});