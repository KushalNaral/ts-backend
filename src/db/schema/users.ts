import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "worker",
  "admin",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "disabled",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    email: varchar("email", {
      length: 255,
    }).notNull().unique(),

    passwordHash: varchar("password_hash", {
      length: 255,
    }).notNull(),

    role: userRoleEnum("role").notNull(),

    status: userStatusEnum("status")
      .notNull()
      .default("active"),

    lastLoginAt: timestamp("last_login_at", {
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
    index("users_role_idx").on(table.role),
    index("users_status_idx").on(table.status),
  ],
);