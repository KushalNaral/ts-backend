/**
 * Unit tests for RSA Key Generator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RSAKeyGenerator } from '@/identity/infrastructure/rsa-key-generator';
import { MemoryKeyStorage } from '@/identity/infrastructure/memory-key-storage';
import type { KeyPair } from '@/identity/domain/key-generator';

describe('RSAKeyGenerator', () => {
  let keyGenerator: RSAKeyGenerator;
  let secureKeyStorage: MemoryKeyStorage;

  beforeEach(() => {
    secureKeyStorage = new MemoryKeyStorage();
    keyGenerator = new RSAKeyGenerator('RS256', 2048, secureKeyStorage);
  });

  describe('constructor', () => {
    it('should create with default parameters', () => {
      const generator = new RSAKeyGenerator();
      expect(generator).toBeDefined();
    });

    it('should create with custom algorithm', () => {
      const generator = new RSAKeyGenerator('RS384');
      expect(generator).toBeDefined();
    });

    it('should create with custom modulus length', () => {
      const generator = new RSAKeyGenerator('RS256', 4096);
      expect(generator).toBeDefined();
    });

    it('should create with secure key storage', () => {
      const storage = new MemoryKeyStorage();
      const generator = new RSAKeyGenerator('RS256', 2048, storage);
      expect(generator).toBeDefined();
    });
  });

  describe('generateKeyPair', () => {
    it('should generate a valid key pair', async () => {
      const keyPair: KeyPair = await keyGenerator.generateKeyPair();
      
      expect(keyPair).toBeDefined();
      expect(keyPair.keyId).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.algorithm).toBe('RS256');
    });

    it('should store private key securely when storage is provided', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      
      const hasKey = await secureKeyStorage.hasPrivateKey(keyPair.keyId);
      expect(hasKey).toBe(true);
    });

    it('should generate unique key IDs', async () => {
      const keyPair1 = await keyGenerator.generateKeyPair();
      const keyPair2 = await keyGenerator.generateKeyPair();
      
      expect(keyPair1.keyId).not.toBe(keyPair2.keyId);
    });

    it('should generate valid JSON for public key', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      
      expect(() => JSON.parse(keyPair.publicKey)).not.toThrow();
      const publicKeyObj = JSON.parse(keyPair.publicKey);
      expect(publicKeyObj).toHaveProperty('kty');
      expect(publicKeyObj).toHaveProperty('n');
      expect(publicKeyObj).toHaveProperty('e');
    });

    it('should generate valid JSON for private key', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      
      expect(() => JSON.parse(keyPair.privateKey)).not.toThrow();
      const privateKeyObj = JSON.parse(keyPair.privateKey);
      expect(privateKeyObj).toHaveProperty('kty');
      expect(privateKeyObj).toHaveProperty('d');
    });
  });

  describe('generateKeyId', () => {
    it('should generate a unique key ID', () => {
      const keyId1 = keyGenerator.generateKeyId();
      const keyId2 = keyGenerator.generateKeyId();
      
      expect(keyId1).toBeDefined();
      expect(keyId2).toBeDefined();
      expect(keyId1).not.toBe(keyId2);
    });

    it('should generate key ID with expected format', () => {
      const keyId = keyGenerator.generateKeyId();
      
      expect(keyId).toMatch(/^kid_[a-z0-9]+_[a-z0-9]+$/);
    });
  });

  describe('parsePublicKey', () => {
    it('should parse a valid public key JWK', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      const publicKey = await keyGenerator.parsePublicKey(keyPair.publicKey);
      
      expect(publicKey).toBeDefined();
    });

    it('should throw error for invalid JSON', async () => {
      await expect(
        keyGenerator.parsePublicKey('invalid json')
      ).rejects.toThrow();
    });
  });

  describe('parsePrivateKey', () => {
    it('should parse a valid private key JWK', async () => {
      const keyPair = await keyGenerator.generateKeyPair();
      const privateKey = await keyGenerator.parsePrivateKey(keyPair.privateKey);
      
      expect(privateKey).toBeDefined();
    });

    it('should throw error for invalid JSON', async () => {
      await expect(
        keyGenerator.parsePrivateKey('invalid json')
      ).rejects.toThrow();
    });
  });
});