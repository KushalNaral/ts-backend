import {z} from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform((t: string) => parseInt(t, 10)).default(3000),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().min(12, 'JWT_SECRET must be 12 or more'),

    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    POSTGRES_PORT: z.string().transform((t: string) => parseInt(t,10)).default(5434),

    REDIS_PORT: z.string().transform((t: string) => parseInt(t,10)).default(6380),
    REDIS_HOST: z.string().default('localhost'),
    
    // Identity Service Configuration
    IDENTITY_SERVICE_PORT: z.string().transform((t: string) => parseInt(t, 10)).default(3001),
    JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
    JWT_KEY_ROTATION_DAYS: z.string().transform((t: string) => parseInt(t, 10)).default(30),
    JWT_KEY_DEPRECATION_DAYS: z.string().transform((t: string) => parseInt(t, 10)).default(7),
    SERVICE_TRUST_ENABLED: z.string().transform((val) => val === 'true').default(true),
    JWKS_CACHE_TTL: z.string().transform((t: string) => parseInt(t, 10)).default(300),
    
    // Secure Key Storage Configuration
    KEY_STORAGE_TYPE: z.enum(['memory', 'env', 'hsm', 'aws-kms', 'azure-keyvault']).default('memory'),
});

const envServer = envSchema.safeParse(process.env);

if(!envServer.success){
    console.error("invalid env vars");
    console.error(z.treeifyError(envServer.error));
    process.exit(1);
}

const env = envServer.data

export {
   env,
   envSchema,
}