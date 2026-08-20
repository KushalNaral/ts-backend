import { authRouter } from "@/auth/router";
import { healthRouter } from "@/routers/health";
import { router } from "@/server/trpc";
 
export const appRouter = router({
    health: healthRouter,
    auth: authRouter
});
 
export type AppRouter = typeof appRouter;