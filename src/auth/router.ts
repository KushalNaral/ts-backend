import { registerInput, registerResponseSchema } from "@/auth/schemas/auth.schemas";
import { authService } from "@/container";
import { publicProcedure, router } from "@/server/trpc";

export const authRouter = router({
    register: publicProcedure
        .input(registerInput)
        .output(registerResponseSchema)
        .mutation(async ({ input }) => {
            return authService.register(input);
        })
});