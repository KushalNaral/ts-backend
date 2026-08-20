import { env } from "@/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import type { z } from "zod";

export const db = drizzle(env.DATABASE_URL);
export type Database = typeof db;

// tf is this i dont know
// seems like type extraction yolo
// this is done sot hat the query and the transactions are done with the same type
// Database allows query but transsaction doenst
// so we extract it
export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];

export type DatabaseExecutor = Database | DatabaseTransaction;