import type { User, PublicUser } from "@/auth/schemas/auth.schemas";

export function toPublicUser(
    user: User
): PublicUser {

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}