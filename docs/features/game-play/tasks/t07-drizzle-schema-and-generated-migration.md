---
id: T7
title: "Write the Drizzle schema for the 5 game-play tables, generate the migration and diff it against the staged SQL"
layer: "migration"
deps: ["T1"]
acs: ["AC-21", "AC-22b", "AC-29"]
files_hint: ["apps/server/src/infrastructure/db/schema/", "apps/server/src/infrastructure/db/migrations/", "apps/server/src/infrastructure/db/connection.ts", "apps/server/drizzle.config.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T7 — Write the Drizzle schema for the 5 game-play tables, generate the migration and diff it against the staged SQL

## Why

Tables from [data-model.md](../data-model.md). Migration rules from `.claude/rules/migrations.md` §Live migrations: live migrations are generated only by drizzle-kit, and the staged `.up.sql` files are the reviewed reference.

**ACs:** AC-21, AC-22b, AC-29 ([PRD §5](../PRD.md)) · **Blocked by:** T1 · **Estimate:** M

## What

- Install `drizzle-orm`, `drizzle-kit` and the PostgreSQL driver. Add `drizzle.config.ts`.
- Connection module (Drizzle + pool; the `DATABASE_URL` name comes from `.env.example`).
- Write `schema/*.ts` for `games`, `player_active_games`, `half_moves`, `game_commands`, `rematch_offers`, mirroring data-model.md: types and lengths, nullability, composite PKs, FKs and FK indexes, unique and partial unique indexes, and the partial index `idx_games_active_turn_started_at`.
- Run `make db-generate`; drizzle-kit writes the live migration.
- **Do not copy** the staged files into `migrations/`.
- Diff the generated SQL against the 5 staged `docs/features/game-play/migrations/*.up.sql`. A difference means the schema or the reference is wrong: fix the schema, or flag the reference in the PR.
- Run `make migrate` on the local PostgreSQL.

**Files:** `apps/server/src/infrastructure/db/schema/`, `apps/server/src/infrastructure/db/migrations/`, `apps/server/src/infrastructure/db/connection.ts`, `apps/server/drizzle.config.ts`

## Definition of Done

- [ ] The generated SQL is equivalent to the staged `.up.sql`: same tables, columns, types, nullability, PKs, FKs and indexes, including the partial predicates.
- [ ] Every remaining difference is listed in the PR and is either fixed or explained (expected: drizzle-kit emits no `IF NOT EXISTS`).
- [ ] `make migrate` succeeds on an empty database, and a second run is a no-op.
- [ ] The staged files are unchanged, and the live `migrations/` folder contains only drizzle-kit output.
- [ ] lint + typecheck clean

## Notes

- Migration lane, serialized by `implement-tasks`.
- The live tree has no down migrations. A rollback is a new forward migration, and the staged `.down.sql` is the plan for it.
- Use ``.where(sql`...`)`` for the partial indexes. Check that drizzle-kit keeps the predicates.
