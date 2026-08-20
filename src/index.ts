import { env } from '@/config/env.js';
import 'dotenv/config';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { appRouter } from '@/server/appRouter';

const app = express();
const port = env.PORT;


const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

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