import { initTRPC } from '@trpc/server';
import type { Context } from '@/server/context';

// trpc with custom context 
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;