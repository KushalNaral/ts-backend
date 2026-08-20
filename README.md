# Basic business logic

customer must have role=customer
worker must have role=worker

only AVAILABLE worker can claim

only PENDING job can be claimed

PENDING → ASSIGNED
ASSIGNED → IN_PROGRESS
IN_PROGRESS → COMPLETED

BUSY worker cannot claim another job

COMPLETED job cannot be modified


# Relationship

                         ┌──────────────┐
                         │    users     │
                         │              │
                         │ id           │
                         │ role         │
                         │ passwordHash │
                         └──────┬───────┘
                                │
                 ┌──────────────┼───────────────┐
                 │              │               │
                 │              │               │
                 ▼              ▼               ▼
          user_sessions      workers           jobs
                               │                 │
                               │                 │
                               │                 │
                               └───────┐   ┌─────┘
                                       ▼   ▼
                                    assignments
                                         │
                                         ▼
                                    job_events