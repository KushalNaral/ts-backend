import { publicProcedure, router } from "@/server/trpc";
 
export const appRouter = router({
    health: publicProcedure
    .query(async () => {
        const health: { status:number, message: string} = {
            status: 200,
            message: "ok : system up and running"
        }
        return health;
    })
});
 
export type AppRouter = typeof appRouter;