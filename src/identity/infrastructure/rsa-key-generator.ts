/**
 * RSA Key Generator implementation using JOSE library
 * Generates RSA key pairs for JWT signing and verification
 * Works with secure key storage to ensure private keys never touch the database
 */

import { generateKeyPair, exportJWK, importJWK } from 'jose';
import type { KeyPair, KeyGenerator } from '@/identity/domain/key-generator';
import type { SecureKeyStorage } from '@/identity/domain/secure-key-storage';
import { randomUUID } from 'crypto';

export class RSAKeyGenerator implements KeyGenerator {
  private algorithm: string = 'RS256';
  private modulusLength: number = 2048;

  constructor(
    algorithm: string = 'RS256', 
    modulusLength: number = 2048,
    private readonly secureKeyStorage?: SecureKeyStorage
  ) {
    this.algorithm = algorithm;
    this.modulusLength = modulusLength;
  }

  async generateKeyPair(): Promise<KeyPair> {
    const { publicKey, privateKey } = await generateKeyPair(this.algorithm, {
      extractable: true,
    });

    const publicJWK = await exportJWK(publicKey);
    const privateJWK = await exportJWK(privateKey);

    const keyId = this.generateKeyId();
    
    // Store private key securely if storage is provided
    if (this.secureKeyStorage) {
      await this.secureKeyStorage.storePrivateKey(keyId, JSON.stringify(privateJWK));
    }

    return {
      keyId,
      publicKey: JSON.stringify(publicJWK),
      privateKey: JSON.stringify(privateJWK), // Only returned if no secure storage
      algorithm: this.algorithm,
    };
  }

  generateKeyId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomUUID().replace(/-/g, '').substring(0, 8);
    return `kid_${timestamp}_${random}`;
  }

  async parsePublicKey(publicKeyJWK: string): Promise<unknown> {
    const jwk = JSON.parse(publicKeyJWK);
    return await importJWK(jwk, this.algorithm);
  }

  async parsePrivateKey(privateKeyJWK: string): Promise<unknown> {
    const jwk = JSON.parse(privateKeyJWK);
    return await importJWK(jwk, this.algorithm);
  }
}