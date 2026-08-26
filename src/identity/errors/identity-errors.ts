/**
 * Custom error classes for Identity Service
 * Provides specific error types for different failure scenarios
 */

export class IdentityError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'IdentityError';
  }
}

export class KeyGenerationError extends IdentityError {
  constructor(message: string = 'Failed to generate cryptographic key') {
    super(message, 'KEY_GENERATION_ERROR');
    this.name = 'KeyGenerationError';
  }
}

export class KeyNotFoundError extends IdentityError {
  constructor(keyId: string) {
    super(`Key with ID ${keyId} not found`, 'KEY_NOT_FOUND');
    this.name = 'KeyNotFoundError';
  }
}

export class KeyRevocationError extends IdentityError {
  constructor(message: string = 'Failed to revoke key') {
    super(message, 'KEY_REVOCATION_ERROR');
    this.name = 'KeyRevocationError';
  }
}

export class RedisConnectionError extends IdentityError {
  constructor(message: string = 'Failed to connect to Redis') {
    super(message, 'REDIS_CONNECTION_ERROR');
    this.name = 'RedisConnectionError';
  }
}

export class RedisOperationError extends IdentityError {
  constructor(message: string = 'Redis operation failed') {
    super(message, 'REDIS_OPERATION_ERROR');
    this.name = 'RedisOperationError';
  }
}

export class JWKSGenerationError extends IdentityError {
  constructor(message: string = 'Failed to generate JWKS') {
    super(message, 'JWKS_GENERATION_ERROR');
    this.name = 'JWKSGenerationError';
  }
}

export class ServiceRegistrationError extends IdentityError {
  constructor(message: string = 'Failed to register service') {
    super(message, 'SERVICE_REGISTRATION_ERROR');
    this.name = 'ServiceRegistrationError';
  }
}

export class ServiceNotFoundError extends IdentityError {
  constructor(serviceId: string) {
    super(`Service with ID ${serviceId} not found`, 'SERVICE_NOT_FOUND');
    this.name = 'ServiceNotFoundError';
  }
}

export class SecureKeyStorageError extends IdentityError {
  constructor(message: string = 'Secure key storage operation failed') {
    super(message, 'SECURE_KEY_STORAGE_ERROR');
    this.name = 'SecureKeyStorageError';
  }
}