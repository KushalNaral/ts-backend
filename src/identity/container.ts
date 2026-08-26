/**
 * Identity Service Dependency Container
 * Manages dependencies for identity service components
 */

import { RSAKeyGenerator } from '@/identity/infrastructure/rsa-key-generator';
import { MemoryKeyStorage } from '@/identity/infrastructure/memory-key-storage';
import { JWKSProviderImpl } from '@/identity/infrastructure/jwks-provider.impl';
import { JWTKeyRepository } from '@/identity/repository/jwt-key.repository';
import { RedisClientImpl } from '@/identity/infrastructure/redis-client.impl';
import { RedisSessionService } from '@/identity/infrastructure/redis-session-service';
import { db } from '@/db';
import { env } from '@/config/env';

// Secure key storage based on environment
const secureKeyStorage = env.KEY_STORAGE_TYPE === 'memory' 
  ? new MemoryKeyStorage() 
  : new MemoryKeyStorage(); // Default to memory for now

// Key generator with secure storage
const keyGenerator = new RSAKeyGenerator('RS256', 2048, secureKeyStorage);

// JWT Key repository
const jwtKeyRepository = new JWTKeyRepository(db);

// JWKS provider
const jwksProvider = new JWKSProviderImpl(jwtKeyRepository);

// Redis client
const redisClient = new RedisClientImpl(`redis://${env.REDIS_HOST}:${env.REDIS_PORT}`);

// Session service
const sessionService = new RedisSessionService(redisClient);

export const identityContainer = {
  secureKeyStorage,
  keyGenerator,
  jwtKeyRepository,
  jwksProvider,
  redisClient,
  sessionService,
};