import { initTRPC } from '@trpc/server';
import type { Context } from '@/server/context';
import { ZodError } from 'zod';

// trpc with custom context 
const t = initTRPC.context<Context>().create({
    errorFormatter({shape, error}){
        if (error.cause instanceof ZodError){
            return {
                ...shape,
                data: {
                    ...shape.data,

                    validationErrors: error.cause.issues.map(issue => ({
                        path: issue.path,
                        message: issue.message,
                        code: issue.code,
                    })),
                },
            };
        }
        return shape;
    }
});

export const router = t.router;
export const publicProcedure = t.procedure;