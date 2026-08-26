import { env } from '@/config/env.js';
import 'dotenv/config';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '@/server/appRouter';
import { createContext } from '@/server/context';
import { KeyInitializer } from '@/identity/infrastructure/key-initializer';
import { identityContainer } from '@/identity/container';

const app = express();
const port = env.PORT;

app.use('/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext
    })
)

async function startServer() {
    try {
        // Initialize cryptographic keys
        const keyInitializer = new KeyInitializer(
            identityContainer.keyGenerator,
            identityContainer.jwtKeyRepository,
            identityContainer.secureKeyStorage
        );
        await keyInitializer.initializeKeys();

        app.listen(port, () => {
            console.log("app working on port: " + port);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();