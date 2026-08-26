/**
 * JWT Keys schema for storing key metadata and public keys only
 * Private keys are stored securely using environment variables or secret management
 * This approach ensures private keys never touch the database for security compliance
 */

import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";

export const jwtKeyStatusEnum = pgEnum("jwt_key_status", [
  "active",
  "deprecated",
  "revoked",
]);

export const jwtKeyAlgorithmEnum = pgEnum("jwt_key_algorithm", [
  "RS256",
  "RS384",
  "RS512",
]);

export const jwtKeys = pgTable(
  "jwt_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    keyId: varchar("key_id", {
      length: 255,
    }).notNull().unique(),

    publicKey: text("public_key").notNull(),

    algorithm: jwtKeyAlgorithmEnum("algorithm")
      .notNull()
      .default("RS256"),

    status: jwtKeyStatusEnum("status")
      .notNull()
      .default("active"),

    activatedAt: timestamp("activated_at", {
      withTimezone: true,
    }),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),

    deprecatedAt: timestamp("deprecated_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("jwt_keys_key_id_idx").on(table.keyId),
    index("jwt_keys_status_idx").on(table.status),
    index("jwt_keys_algorithm_idx").on(table.algorithm),
  ],
);