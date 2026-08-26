/**
 * Domain interface for JWKS (JSON Web Key Set) operations
 * Defines the contract for providing public keys for JWT verification
 */

export interface JWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

export interface JWKSResponse {
  keys: JWK[];
}

export interface JWKSProvider {
  getJWKS(): Promise<JWKSResponse>;
  getKeyById(keyId: string): Promise<JWK | null>;
  getActiveKey(): Promise<JWK | null>;
}