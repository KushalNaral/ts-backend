import { AuthService } from "@/auth/application/auth.service";
import { Argon2PasswordManager } from "@/auth/infrastructure/argon2-password-manager";
import { UserRepository } from "@/auth/repository/user.repository";
import { db } from "@/db";

const passwordManager = new Argon2PasswordManager();
const userRepository = new UserRepository(db);

export const authService = new AuthService(
    passwordManager,
    userRepository
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