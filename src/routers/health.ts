import { publicProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { z } from "zod";


const healthResponseSchema = z.object({
      status: z.enum(["ok", "error"]),
    message: z.string()
})

type HealthResponse = z.infer<typeof healthResponseSchema>;

export const healthRouter = router({
    check: publicProcedure
        .output(healthResponseSchema)
        .query(async ({ctx}): Promise<HealthResponse> => {

            try {
                await ctx.db.execute(sql`SELECT 1`);
                return {
                    status: "ok",
                    message: "ok : trpc server is up and running"
                }
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "database unavailable"
                })
            }
        })
})