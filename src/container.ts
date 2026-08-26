import { AuthService } from "@/auth/application/auth.service";
import { Argon2PasswordManager } from "@/auth/infrastructure/argon2-password-manager";
import { DrizzleAuthUnitOfWork } from "@/auth/infrastructure/drizzle-auth-unit-of-work";
import { JWTTokenService } from "@/identity/infrastructure/jwt-token-service";
import { identityContainer } from "@/identity/container";
import { db } from "@/db";

const passwordManager = new Argon2PasswordManager();
const authUnitOfWork = new DrizzleAuthUnitOfWork(db);
const tokenService = new JWTTokenService(
    identityContainer.jwksProvider,
    identityContainer.secureKeyStorage
);

export const authService = new AuthService(
    authUnitOfWork,
    passwordManager,
    tokenService,
    identityContainer.sessionService,
) 
// this is basically just something like a depenedncy provider
// we wirte dependencies and container that require each other here into one container and pass them around
// kind of like how dependency injection framworks work in go? i think
// then we just add this to the context and use it everywhere
// plus i can create my own authService later on and then use it
// something like this if put together diagramatically

        //             container.ts
        //                  │
        //   ┌──────────────┼──────────────┐
        //   ▼              ▼              ▼
        //  db       UserRepository   PasswordManager
        //   │              │              │
        //   │              └──────┬───────┘
        //   │                     ▼
        //   │                AuthService
        //   │                     │
        //   └─────────────────────┤
        //                         ▼
        //                     tRPC Context
        //                         │
        //                         ▼
        //                       Router

// update
// we just removed the db from here into the scope so that we have transaction
// these transactions are scoped and are implementation of unit-of-work