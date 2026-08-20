import { env } from '@/config/env.js';
import 'dotenv/config';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '@/server/appRouter';
import { createContext } from '@/server/context';

const app = express();
const port = env.PORT;

app.use('/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext
    })
)

app.listen(port, () => {
    console.log("app working on port: " + port);
})

console.log("env", env)