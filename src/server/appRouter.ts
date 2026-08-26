import { authRouter } from "@/auth/router";
import { healthRouter } from "@/routers/health";
import { createJWKSRouter } from "@/identity/router/jwks-router";
import { identityContainer } from "@/identity/container";
import { router } from "@/server/trpc";

const jwksRouter = createJWKSRouter(identityContainer.jwksProvider);

export const appRouter = router({
    health: healthRouter,
    auth: authRouter,
    jwks: jwksRouter
});

export type AppRouter = typeof appRouter;