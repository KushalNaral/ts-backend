/**
 * JWT Key Repository for database operations
 * Handles CRUD operations for JWT keys in the database
 */

import type { Database, DatabaseExecutor } from "@/db";
import { jwtKeys } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface JWTKey {
  id: string;
  keyId: string;
  publicKey: string;
  algorithm: string;
  status: "active" | "deprecated" | "revoked";
  activatedAt: Date | null;
  expiresAt: Date | null;
  deprecatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJWTKeyData {
  keyId: string;
  publicKey: string;
  algorithm: "RS256" | "RS384" | "RS512";
  expiresAt?: Date;
}

export class JWTKeyRepository {
  constructor(private readonly db: DatabaseExecutor) {}

  async findById(id: string): Promise<JWTKey | null> {
    const [key] = await this.db
      .select()
      .from(jwtKeys)
      .where(eq(jwtKeys.id, id))
      .limit(1);

    return key ?? null;
  }

  async findByKeyId(keyId: string): Promise<JWTKey | null> {
    const [key] = await this.db
      .select()
      .from(jwtKeys)
      .where(eq(jwtKeys.keyId, keyId))
      .limit(1);

    return key ?? null;
  }

  async findActiveKeys(): Promise<JWTKey[]> {
    return await this.db
      .select()
      .from(jwtKeys)
      .where(eq(jwtKeys.status, 'active'))
      .orderBy(desc(jwtKeys.createdAt));
  }

  async create(data: CreateJWTKeyData): Promise<JWTKey> {
    const [createdKey] = await this.db
      .insert(jwtKeys)
      .values({
        keyId: data.keyId,
        publicKey: data.publicKey,
        algorithm: data.algorithm,
        status: 'active',
        activatedAt: new Date(),
        expiresAt: data.expiresAt,
      })
      .returning();

    if (!createdKey) {
      throw new Error('Failed to create JWT key');
    }

    return createdKey;
  }

  async activateKey(keyId: string): Promise<JWTKey | null> {
    const [updatedKey] = await this.db
      .update(jwtKeys)
      .set({
        status: 'active',
        activatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jwtKeys.keyId, keyId))
      .returning();

    return updatedKey ?? null;
  }

  async deactivateKey(keyId: string): Promise<JWTKey | null> {
    const [updatedKey] = await this.db
      .update(jwtKeys)
      .set({
        status: 'deprecated',
        deprecatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jwtKeys.keyId, keyId))
      .returning();

    return updatedKey ?? null;
  }

  async revokeKey(keyId: string): Promise<JWTKey | null> {
    const [updatedKey] = await this.db
      .update(jwtKeys)
      .set({
        status: 'revoked',
        updatedAt: new Date(),
      })
      .where(eq(jwtKeys.keyId, keyId))
      .returning();

    return updatedKey ?? null;
  }

  async delete(keyId: string): Promise<boolean> {
    const result = await this.db
      .delete(jwtKeys)
      .where(eq(jwtKeys.keyId, keyId))
      .returning();

    return result.length > 0;
  }
}