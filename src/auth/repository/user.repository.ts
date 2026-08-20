import type { CreateUserData, UpdateUserData, UpdateUserStatus } from "@/auth/schemas/auth.schemas";
import type { EmptyRelations } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

export class UserRepository {

    constructor(private readonly db: NodePgDatabase<EmptyRelations> & {
        $client: Pool;
    }) { }

    findById(id: string) { }
    findByEmail(email: string) { }
    create(data: CreateUserData) { }
    update(id: string, data: UpdateUserData) { }
    updateStatus(id: string, data: UpdateUserStatus) { }
    delete(id: string) { }

}