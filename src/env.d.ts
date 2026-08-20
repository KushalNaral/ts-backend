import { envSchema } from "@/config/env.ts";
import type { z } from "zod";

declare global {
    namespace NodeJs {
        interface ProcessEnv extends z.infer<typeof envSchema> {}
    }
}