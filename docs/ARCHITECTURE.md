# Identity Service Architecture

## Architecture Principles

1. **Security First**: Private keys never stored in database - audit compliant
2. **Clean Architecture**: Clear separation between domain, infrastructure, and application layers
3. **Type Safety**: 100% TypeScript strict mode with no implicit any types
4. **Interface-Driven**: Domain interfaces define contracts, infrastructure provides implementations
5. **Defense in Depth**: Multiple security layers with proper key separation

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Identity Microservice                 │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   JWKS      │  │   Token      │  │    Auth      │ │
│  │  Endpoint   │  │   Service    │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   HSM/KMS    │
│              │  │              │  │              │
│ Public Keys  │  │   Tokens     │  │ Private Keys │
│ Metadata     │  │   Sessions   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Component Architecture

### Domain Layer (Interfaces)
- `KeyGenerator` - Cryptographic key generation contract
- `RedisClient` - Redis operations abstraction
- `JWKSProvider` - Public key distribution contract
- `SecureKeyStorage` - Private key storage contract

### Infrastructure Layer (Implementations)
- `RSAKeyGenerator` - RSA key pair generation
- `RedisClientImpl` - Redis client wrapper
- `JWKSProviderImpl` - JWKS endpoint implementation
- `MemoryKeyStorage` - In-memory key storage (dev)
- `EnvKeyStorage` - Environment variable storage (basic)

### Repository Layer
- `JWTKeyRepository` - Database operations for key metadata

### API Layer
- `JWKSRouter` - tRPC router for public key distribution

## Current Endpoints

### JWKS Router (`src/identity/router/jwks-router.ts`)
- `POST /trpc/jwks.getJWKS` - Get all active public keys in JWKS format
- `POST /trpc/jwks.getKeyById` - Get specific public key by key ID

### Auth Router (`src/auth/router.ts`)
- `POST /trpc/auth.register` - User registration
- `POST /trpc/auth.login` - User login with JWT token generation
- `POST /trpc/auth.getUser` - Get user by ID
- `POST /trpc/auth.updateUser` - Update user profile
- `POST /trpc/auth.deleteUser` - Delete user account
- `POST /trpc/auth.refresh` - Refresh access token using refresh token
- `POST /trpc/auth.logout` - Logout and revoke refresh token

### Health Router (`src/routers/health.ts`)
- `POST /trpc/health.check` - Health check endpoint

## Security Architecture

### Key Storage Strategy
- **Database**: Key metadata + public keys only
- **Secure Storage**: Private keys (HSM/KMS/Environment)
- **JWKS Endpoint**: Public keys only

### Security Zones
- **Public Zone**: JWKS endpoint (public keys only)
- **Private Zone**: Token/auth services
- **Restricted Zone**: HSM/KMS hardware security
- **Data Zone**: PostgreSQL (public keys), Redis (tokens)

## Key Lifecycle

```
Generating → Active → Deprecated → Revoked
              ↓          ↓           ↓
         Normal      Grace      Immediate
         Operation   Period     Removal
```

## Database Schema

### jwt_keys Table
- `id` - UUID primary key
- `key_id` - Unique key identifier
- `public_key` - JWK format public key
- `algorithm` - RS256/RS384/RS512
- `status` - active/deprecated/revoked
- `activated_at`, `expires_at`, `deprecated_at` - Lifecycle timestamps

### registered_services Table
- `id` - UUID primary key
- `service_name` - Service identifier
- `service_id` - Unique service ID
- `public_key` - Service public key
- `allowed_scopes` - JSON array of permitted scopes
- `status` - active/inactive/suspended

## Configuration

```env
IDENTITY_SERVICE_PORT=3001
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
JWT_KEY_ROTATION_DAYS=30
JWT_KEY_DEPRECATION_DAYS=7
KEY_STORAGE_TYPE=memory # memory, env, hsm, aws-kms, azure-keyvault
SERVICE_TRUST_ENABLED=true
JWKS_CACHE_TTL=300
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Module Documentation

### Key Generation Module (`src/identity/infrastructure/rsa-key-generator.ts`)
- Generates RSA key pairs using JOSE library
- Supports RS256, RS384, RS512 algorithms
- Integrates with secure key storage for private keys
- Generates unique key IDs with timestamp

### JWKS Provider Module (`src/identity/infrastructure/jwks-provider.impl.ts`)
- Converts database keys to JWKS format
- Provides public keys for JWT verification
- Handles multiple active keys for rotation
- Returns most recent active key by default

### Secure Key Storage (`src/identity/domain/secure-key-storage.ts`)
- Defines interface for private key storage
- Supports multiple backends (memory, env, HSM, cloud KMS)
- Ensures private keys never touch database
- Provides audit compliance

## Testing

- **87 tests total** - all passing
- **Unit tests**: Individual component testing
- **Integration tests**: Complete key management flows
- **Edge case tests**: Boundary conditions and error scenarios
- **Test coverage**: High coverage of critical paths

## Technology Stack

- **TypeScript**: Strict mode, 100% type safety
- **JOSE**: JWT operations and key generation
- **Redis**: Token storage and caching
- **PostgreSQL**: Key metadata storage
- **tRPC**: Type-safe API layer
- **Vitest**: Testing framework
- **Drizzle ORM**: Database operations