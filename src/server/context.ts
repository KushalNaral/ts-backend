import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { db } from "@/db";
import { authService } from "@/container";

// doing dependency injection of db into ctx
export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions) => {
  
  return {
    req,
    res,
    db,
    authService
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;