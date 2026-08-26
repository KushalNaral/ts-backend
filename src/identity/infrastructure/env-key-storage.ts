/**
 * Environment Variable based Secure Key Storage
 * Stores private keys in environment variables for development/simple deployments
 * For production, consider using HSM, AWS KMS, Azure Key Vault, or similar
 */

import type { SecureKeyStorage } from '@/identity/domain/secure-key-storage';

export class EnvKeyStorage implements SecureKeyStorage {
  private keyPrefix = 'JWT_PRIVATE_KEY_';

  storePrivateKey(keyId: string, privateKey: string): Promise<void> {
    // In production, this would store in HSM, KMS, or secure secret manager
    // For development, we use environment variables (not ideal but better than database)
    process.env[`${this.keyPrefix}${keyId}`] = privateKey;
    return Promise.resolve();
  }

  async getPrivateKey(keyId: string): Promise<string | null> {
    const privateKey = process.env[`${this.keyPrefix}${keyId}`];
    return privateKey || null;
  }

  async deletePrivateKey(keyId: string): Promise<void> {
    delete process.env[`${this.keyPrefix}${keyId}`];
  }

  async hasPrivateKey(keyId: string): Promise<boolean> {
    const privateKey = process.env[`${this.keyPrefix}${keyId}`];
    return privateKey !== undefined;
  }
}