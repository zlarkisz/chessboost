---
id: T8
title: "Implement DrizzleGameRepository with one transaction per action, a version check and the command ledger"
layer: "infra"
deps: ["T6", "T7"]
acs: ["AC-21", "AC-22b", "AC-25b", "AC-27b", "AC-29", "AC-29b"]
files_hint: ["apps/server/src/game/domain/ports/game-repository.ts", "apps/server/src/game/infrastructure/drizzle-game-repository.ts"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T8 — Implement DrizzleGameRepository with one transaction per action, a version check and the command ledger

## Why

PostgreSQL is the source of truth, and each accepted action is one transaction ([ADR-0003](../adr/0003-persist-each-action-before-broadcast-with-per-game-queue.md)). Tables: [data-model.md](../data-model.md).

**ACs:** AC-21, AC-22b, AC-25b, AC-27b, AC-29, AC-29b ([PRD §5](../PRD.md)) · **Blocked by:** T6, T7 · **Estimate:** L

## What

- `GameRepository` port.
- Load a game by id, with the last half-move and the open rematch offer.
- Save in one transaction:
  - update `games` where `version` matches (0 rows → conflict);
  - insert into `half_moves`;
  - insert into `game_commands` (a duplicate `commandId` → returns the original outcome).
- Create a game: insert `games` + `player_active_games`. A PK violation becomes a typed `PlayerHasActiveGame`.
- Close the open rematch offers of given players inside the same transaction (AC-25b).
- Delete the `player_active_games` rows on end or abort.
- `rematch_offers`: insert, close, find open.
- `listActive()` for boot.

**Files:** `apps/server/src/game/domain/ports/game-repository.ts`, `apps/server/src/game/infrastructure/drizzle-game-repository.ts`

## Definition of Done

- [ ] Integration tests on the real PostgreSQL from `make dev` (test database) pass for:
  - a full round-trip of every column;
  - a version conflict is detected;
  - a duplicate `commandId` is detected;
  - a second active game for a player gives the typed error;
  - ending a game frees both players;
  - only one open rematch offer per game.
- [ ] lint + typecheck clean

## Notes

- The test database comes from a variable named in `.env.example`. Never read `.env`.
