/**
 * Unit tests for Secure Key Storage implementations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryKeyStorage } from '@/identity/infrastructure/memory-key-storage';
import { EnvKeyStorage } from '@/identity/infrastructure/env-key-storage';

describe('MemoryKeyStorage', () => {
  let storage: MemoryKeyStorage;

  beforeEach(() => {
    storage = new MemoryKeyStorage();
  });

  describe('storePrivateKey', () => {
    it('should store a private key', async () => {
      await storage.storePrivateKey('key1', 'private-key-value');
      const hasKey = await storage.hasPrivateKey('key1');
      expect(hasKey).toBe(true);
    });

    it('should overwrite existing key', async () => {
      await storage.storePrivateKey('key1', 'first-value');
      await storage.storePrivateKey('key1', 'second-value');
      const key = await storage.getPrivateKey('key1');
      expect(key).toBe('second-value');
    });
  });

  describe('getPrivateKey', () => {
    it('should retrieve stored private key', async () => {
      await storage.storePrivateKey('key1', 'private-key-value');
      const key = await storage.getPrivateKey('key1');
      expect(key).toBe('private-key-value');
    });

    it('should return null for non-existent key', async () => {
      const key = await storage.getPrivateKey('nonexistent');
      expect(key).toBeNull();
    });
  });

  describe('deletePrivateKey', () => {
    it('should delete stored private key', async () => {
      await storage.storePrivateKey('key1', 'private-key-value');
      await storage.deletePrivateKey('key1');
      const hasKey = await storage.hasPrivateKey('key1');
      expect(hasKey).toBe(false);
    });

    it('should handle deleting non-existent key', async () => {
      await expect(storage.deletePrivateKey('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('hasPrivateKey', () => {
    it('should return true for existing key', async () => {
      await storage.storePrivateKey('key1', 'private-key-value');
      const hasKey = await storage.hasPrivateKey('key1');
      expect(hasKey).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const hasKey = await storage.hasPrivateKey('nonexistent');
      expect(hasKey).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all stored keys', async () => {
      await storage.storePrivateKey('key1', 'value1');
      await storage.storePrivateKey('key2', 'value2');
      storage.clear();
      expect(await storage.hasPrivateKey('key1')).toBe(false);
      expect(await storage.hasPrivateKey('key2')).toBe(false);
    });
  });
});

describe('EnvKeyStorage', () => {
  let storage: EnvKeyStorage;

  beforeEach(() => {
    storage = new EnvKeyStorage();
    // Clean up any existing test keys
    delete process.env['JWT_PRIVATE_KEY_test_key1'];
  });

  afterEach(() => {
    // Clean up test keys
    delete process.env['JWT_PRIVATE_KEY_test_key1'];
  });

  describe('storePrivateKey', () => {
    it('should store a private key in environment variable', async () => {
      await storage.storePrivateKey('test_key1', 'private-key-value');
      expect(process.env['JWT_PRIVATE_KEY_test_key1']).toBe('private-key-value');
    });

    it('should overwrite existing environment variable', async () => {
      await storage.storePrivateKey('test_key1', 'first-value');
      await storage.storePrivateKey('test_key1', 'second-value');
      expect(process.env['JWT_PRIVATE_KEY_test_key1']).toBe('second-value');
    });
  });

  describe('getPrivateKey', () => {
    it('should retrieve private key from environment variable', async () => {
      await storage.storePrivateKey('test_key1', 'private-key-value');
      const key = await storage.getPrivateKey('test_key1');
      expect(key).toBe('private-key-value');
    });

    it('should return null for non-existent key', async () => {
      const key = await storage.getPrivateKey('nonexistent');
      expect(key).toBeNull();
    });
  });

  describe('deletePrivateKey', () => {
    it('should delete private key from environment variable', async () => {
      await storage.storePrivateKey('test_key1', 'private-key-value');
      await storage.deletePrivateKey('test_key1');
      expect(process.env['JWT_PRIVATE_KEY_test_key1']).toBeUndefined();
    });

    it('should handle deleting non-existent key', async () => {
      await expect(storage.deletePrivateKey('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('hasPrivateKey', () => {
    it('should return true for existing key', async () => {
      await storage.storePrivateKey('test_key1', 'private-key-value');
      const hasKey = await storage.hasPrivateKey('test_key1');
      expect(hasKey).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const hasKey = await storage.hasPrivateKey('nonexistent');
      expect(hasKey).toBe(false);
    });
  });
});