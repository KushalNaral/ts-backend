import {
  index,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { jobs } from "./jobs.js";
import { workers } from "./workers.js";

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id")
      .notNull()
      .unique()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    workerId: uuid("worker_id")
      .notNull()
      .references(() => workers.id),

    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("assignments_worker_id_idx").on(table.workerId),
  ],
);