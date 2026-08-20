import type { AuthTransactionScope, AuthUnitOfWork } from "@/auth/application/auth-transaction-scope";
import { UserRepository } from "@/auth/repository/user.repository";
import type { Database } from "@/db";

export class DrizzleAuthUnitOfWork implements AuthUnitOfWork {
    
    constructor(
        private readonly db: Database
    ){}
    
    transaction<T>(callback: (scope: AuthTransactionScope) => Promise<T>): Promise<T> {
       
        return this.db.transaction(async(tx) => {
            const scope: AuthTransactionScope = {
                users: new UserRepository(tx),
            }
            return callback(scope);
        })

    }
}