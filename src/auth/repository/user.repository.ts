import type { CreateUserData, UpdateUserData, UpdateUserStatus } from "@/auth/schemas/auth.schemas";
import type { Database } from "@/db";

export class UserRepository {

    constructor(private readonly db: Database) { }

    findById(id: string) { 
    }
    findByEmail(email: string) { }
    create(data: CreateUserData) { }
    update(id: string, data: UpdateUserData) { }
    updateStatus(id: string, data: UpdateUserStatus) { }
    delete(id: string) { }

}