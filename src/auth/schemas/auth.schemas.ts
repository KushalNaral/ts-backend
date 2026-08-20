import { z } from "zod";

export const createUserSchema = z.object({})
export const updateUserSchema = z.object({})
export const updateUserStatus = z.object({})

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type UpdateUserStatus = z.infer<typeof updateUserStatus>;