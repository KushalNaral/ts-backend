import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { authService } from "@/container";
import { db } from "@/db";

// doing dependency injection of db into ctx
export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions) => {
  
  return {
    req,
    res,
    db,
    auth: {
      service: authService
    }
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// basically the flow is updated as such
          //          APPLICATION START
          //                 │
          //                 ▼
          //           container.ts
          //                 │
          //    ┌────────────┼─────────────┐
          //    ▼            ▼             ▼
          //  db        PasswordHasher   AuthUoW
          //    │                          │
          //    │                          ▼
          //    │                DrizzleAuthUnitOfWork
          //    │
          //    └──────────────────────────┘
          //                 │
          //                 ▼
          //            AuthService
          //                 │
          //                 ▼
          //         tRPC Context
          //                 │
          //                 ▼
          //              Router
          //                 │
          //                 ▼
          //              Request