import { register } from "module";
import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string(),
    email: z.email(),
    role: z.enum(["customer", "worker", "admin"]),
    passwordHash: z.string(),
    lastLoginAt: z.coerce.date().nullable().optional(),

});

export const updateUserSchema = z.object({
    name: z.string(),
});

export const updateUserStatus = z.object({
    status: z.enum(["active",
        "suspended",
        "disabled",])
});

export const registerInput = z.object({})
export const loginInput = z.object({})

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type UpdateUserStatus = z.infer<typeof updateUserStatus>;

export type RegisterData = z.infer<typeof registerInput>;
export type LoginData = z.infer<typeof loginInput>;