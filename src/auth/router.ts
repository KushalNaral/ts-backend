import { registerInput, registerResponseSchema, loginInput, loginResponseSchema, getUserInput, getUserResponseSchema, updateUserInput, updateUserResponseSchema, deleteUserInput, deleteUserResponseSchema, refreshInput, refreshResponseSchema, logoutInput, logoutResponseSchema } from "@/auth/schemas/auth.schemas";
import { authService } from "@/container";
import { publicProcedure, router } from "@/server/trpc";

export const authRouter = router({
    register: publicProcedure
        .input(registerInput)
        .output(registerResponseSchema)
        .mutation(async ({ input }) => {
            return authService.register(input);
        }),
    
    login: publicProcedure
        .input(loginInput)
        .output(loginResponseSchema)
        .mutation(async ({ input }) => {
            return authService.login(input);
        }),

    getUser: publicProcedure
        .input(getUserInput)
        .output(getUserResponseSchema)
        .query(async ({ input }) => {
            return authService.getUser(input.userId);
        }),

    updateUser: publicProcedure
        .input(updateUserInput)
        .output(updateUserResponseSchema)
        .mutation(async ({ input }) => {
            return authService.updateUser(input.userId, { name: input.name });
        }),

    deleteUser: publicProcedure
        .input(deleteUserInput)
        .output(deleteUserResponseSchema)
        .mutation(async ({ input }) => {
            return authService.deleteUser(input.userId);
        }),

    refresh: publicProcedure
        .input(refreshInput)
        .output(refreshResponseSchema)
        .mutation(async ({ input }) => {
            return authService.refresh(input.userId, input.refreshToken);
        }),

    logout: publicProcedure
        .input(logoutInput)
        .output(logoutResponseSchema)
        .mutation(async ({ input }) => {
            return authService.logout(input.userId, input.refreshToken);
        }),
});