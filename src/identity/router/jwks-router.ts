/**
 * JWKS Router - provides the JSON Web Key Set endpoint
 * This endpoint is used by services to retrieve public keys for JWT verification
 */

import { publicProcedure, router } from "@/server/trpc";
import type { JWKSProvider } from "@/identity/domain/jwks-provider";

export const createJWKSRouter = (jwksProvider: JWKSProvider) => {
  return router({
    getJWKS: publicProcedure.query(async () => {
      return await jwksProvider.getJWKS();
    }),
    
    getKeyById: publicProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'keyId' in val && typeof val.keyId === 'string') {
          return { keyId: val.keyId };
        }
        throw new Error('Invalid input: keyId is required as string');
      })
      .query(async ({ input }) => {
        return await jwksProvider.getKeyById(input.keyId);
      }),
  });
};