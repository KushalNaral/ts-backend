/**
 * In-memory Secure Key Storage for development/testing
 * Stores private keys in memory only - lost on restart
 * For production, use HSM, AWS KMS, Azure Key Vault, or similar
 */

import type { SecureKeyStorage } from '@/identity/domain/secure-key-storage';

export class MemoryKeyStorage implements SecureKeyStorage {
  private keys: Map<string, string> = new Map();

  async storePrivateKey(keyId: string, privateKey: string): Promise<void> {
    this.keys.set(keyId, privateKey);
  }

  async getPrivateKey(keyId: string): Promise<string | null> {
    const value = this.keys.get(keyId);
    return value || null; // Return null for empty strings
  }

  async deletePrivateKey(keyId: string): Promise<void> {
    this.keys.delete(keyId);
  }

  async hasPrivateKey(keyId: string): Promise<boolean> {
    return this.keys.has(keyId);
  }

  clear(): void {
    this.keys.clear();
  }
}