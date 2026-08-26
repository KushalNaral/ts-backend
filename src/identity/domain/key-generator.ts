/**
 * Domain interface for cryptographic key generation
 * Defines the contract for generating RSA key pairs for JWT signing
 */

export interface KeyPair {
  keyId: string;
  publicKey: string;
  privateKey: string;
  algorithm: string;
}

export interface KeyGenerator {
  generateKeyPair(): Promise<KeyPair>;
  generateKeyId(): string;
}