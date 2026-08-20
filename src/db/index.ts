import { env } from "@/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import type { z } from "zod";

export const db = drizzle(env.DATABASE_URL);
export type Database = typeof db;