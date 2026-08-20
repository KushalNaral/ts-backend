import { users } from "@/db/schema";
import { z } from "zod";

export const registerInput = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
});

export const loginInput = z.object({
    email: z.email(),
    password: z.string(),
});

export const updateUserSchema = z.object({
    name: z.string().min(2),
});

export const updateUserStatus = z.object({
    status: z.enum([
        "active",
        "suspended",
        "disabled",
    ]),
});

export const publicUserSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),

    role: z.enum([
        "customer",
        "worker",
        "admin",
    ]),

    status: z.enum([
        "active",
        "suspended",
        "disabled",
    ]),

    lastLoginAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const registerResponseSchema = z.object({
    user: publicUserSchema,
});

export type RegisterData =
    z.infer<typeof registerInput>;

export type LoginData =
    z.infer<typeof loginInput>;

export type UpdateUserData =
    z.infer<typeof updateUserSchema>;

export type UpdateUserStatus =
    z.infer<typeof updateUserStatus>;

export type User =
    typeof users.$inferSelect;

export type PublicUser =
    z.infer<typeof publicUserSchema>;