import type { CreateUserData, UpdateUserData, UpdateUserStatus } from "@/auth/schemas/auth.schemas";
import type { Database, DatabaseExecutor } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export class UserRepository {

    constructor(private readonly db: DatabaseExecutor) { }

    async findById(id: string) {
        const user = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user;

    }

    async findByEmail(email: string) {
        const user = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user;
    }

    async create(data: CreateUserData) {
        const user: typeof users.$inferInsert = {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role,
            lastLoginAt: data.lastLoginAt,
        };

        const [createdUser] = await this.db
            .insert(users)
            .values(user)
            .returning();

        return createdUser;
    }

    async update(id: string, data: UpdateUserData) {
        const [updatedUser] = await this.db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();

        return updatedUser ?? null;
    }
    async updateStatus(id: string, data: UpdateUserStatus) {
        await this.db
            .update(users)
            .set({
                status: data.status
            })
            .where(eq(users.id, id));
    }

    async delete(id: string) {
        await this.db.delete(users).where(eq(users.id, id))
    }

}