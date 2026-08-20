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
});

const envServer = envSchema.safeParse(process.env);

if(!envServer.success){
    console.error("invalid env vars");
    console.error(JSON.stringify(envServer.error.format(), null, 2));
    process.exit(1);
}

const env = envServer.data

export {
   env,
   envSchema,
}