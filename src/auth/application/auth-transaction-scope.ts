import type { UserRepository } from "@/auth/repository/user.repository";
import type { TransactionScope, UnitOfWork } from "@/infrastructure/database/unit-of-work";

export interface AuthTransactionScope extends TransactionScope {
    users: UserRepository
}

export type AuthUnitOfWork = UnitOfWork<AuthTransactionScope>;
