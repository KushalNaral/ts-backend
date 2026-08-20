import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { jobs } from "./jobs.js";
import { users } from "./users.js";

export const jobEventTypeEnum = pgEnum("job_event_type", [
  "job_created",
  "job_assigned",
  "job_started",
  "job_completed",
  "job_cancelled",
]);

export const jobEvents = pgTable(
  "job_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),

    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),

    type: jobEventTypeEnum("type").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("job_events_job_id_idx").on(table.jobId),
    index("job_events_actor_id_idx").on(table.actorId),
    index("job_events_created_at_idx").on(table.createdAt),
  ],
);