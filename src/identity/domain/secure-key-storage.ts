/**
 * Domain interface for secure private key storage
 * Private keys should never be stored in the database for security compliance
 * This interface provides methods to store and retrieve private keys securely
 */

export interface SecureKeyStorage {
  storePrivateKey(keyId: string, privateKey: string): Promise<void>;
  getPrivateKey(keyId: string): Promise<string | null>;
  deletePrivateKey(keyId: string): Promise<void>;
  hasPrivateKey(keyId: string): Promise<boolean>;
}