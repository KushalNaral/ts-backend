export interface UnitofWork<TScope extends TransactionScope> {
    transaction<T>(
        callback: (scope: TScope) => Promise<T>
    ): Promise<T>;
}

export interface TransactionScope {}

// so reasearching into transactions there was quite a bit of confusion
// what was previously being done was basically this
// controller -> service ( wrapper with tx + error handling ) -> repo
// in here service knew what the transaction was how it was working and more
// and the repo just persisted
// The problem:
//
// A business operation can involve multiple repositories:
//
// register()
//     ├── create user
//     ├── create session
//     └── create something else
//
// These operations need to participate in the SAME database transaction.
// The business service knows that these operations belong
// together, but it should not need to know how PostgreSQL,
// Drizzle, BEGIN, COMMIT, or ROLLBACK work.
//
// Therefore:
//
// Service
//     ↓
// UnitOfWork
//     ↓
// TransactionScope
//     ├── UserRepository
//     ├── UserSessionRepository
//     └── ...
//            ↓
//        PostgreSQL
//
// The service defines the business operation:
//
//     register()
//
// The UnitOfWork defines the atomic persistence boundary:
//
//     transaction(...)
//
// The TransactionScope defines which repositories are available
// within that transaction.
//
// Every repository in the scope receives the SAME underlying
// transaction connection/object.
//
// Therefore:
//
// BEGIN
//     userRepository.create()
//     sessionRepository.create()
//     somethingRepository.create()
// COMMIT
//
// If any operation fails:
//
// ROLLBACK
//
// This keeps the responsibilities separated:
//
// Service
//     → business orchestration
//
// UnitOfWork
//     → transaction lifecycle
//
// TransactionScope
//     → transaction-scoped dependencies
//
// Repository
//     → persistence/query implementation
// simply this
//
//                 UnitOfWork<TScope>
//                        │
//          ┌─────────────┴─────────────┐
//          │                           │
//          ▼                           ▼
//  AuthTransactionScope       JobTransactionScope
//          │                           │
//    ┌─────┴─────┐              ┌──────┼──────┐
//    ▼           ▼              ▼      ▼      ▼
//  users      sessions         jobs assignments events