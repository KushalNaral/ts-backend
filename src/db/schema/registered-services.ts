/**
 * Registered Services schema for service-to-service authentication
 * Stores service credentials and allowed scopes for distributed authentication
 */

import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";

export const serviceStatusEnum = pgEnum("service_status", [
  "active",
  "inactive",
  "suspended",
]);

export const registeredServices = pgTable(
  "registered_services",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    serviceName: varchar("service_name", {
      length: 255,
    }).notNull().unique(),

    serviceId: varchar("service_id", {
      length: 255,
    }).notNull().unique(),

    publicKey: text("public_key").notNull(),

    allowedScopes: text("allowed_scopes")
      .notNull()
      .default('[]'), // JSON array stored as text, parsed in application layer

    status: serviceStatusEnum("status")
      .notNull()
      .default("active"),

    description: text("description"),

    metadata: text("metadata"), // JSON string for additional service metadata

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

    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("registered_services_service_name_idx").on(table.serviceName),
    index("registered_services_service_id_idx").on(table.serviceId),
    index("registered_services_status_idx").on(table.status),
  ],
);