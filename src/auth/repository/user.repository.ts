import type { UpdateUserData, UpdateUserStatus, User } from "@/auth/schemas/auth.schemas";
import type { Database, DatabaseExecutor } from "@/db";
import { users } from "@/db/schema";
import { UserCreationError } from "@/errors/auth-errors";
import { eq } from "drizzle-orm";

type NewUser = typeof users.$inferInsert;
export class UserRepository {

    constructor(private readonly db: DatabaseExecutor) { }

    async findById(id: string): Promise<User | null> {

        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user ?? null;
    }

    async findByEmail(email: string): Promise<User | null> {

        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return user ?? null;
    }

    async create(data: NewUser): Promise<User> {
        const [createdUser] = await this.db
            .insert(users)
            .values(data)
            .returning();

        if (!createdUser) {
            throw new UserCreationError();
        }

        return createdUser;
    }

    async update(id: string, data: UpdateUserData): Promise<User | null> {
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

    async delete(id: string): Promise<boolean> {

        const deleted = await this.db
            .delete(users)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
            });

        return deleted.length > 0;
    }

}