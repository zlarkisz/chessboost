# SPEC — chessboost

## Goals

- Two players play standard chess online in real time (WebSocket), with a clock.
- After every 7th half-move (each side's move counts separately) a boost spawns on a
  random free square; type is random from a fixed set: **invulnerability** (piece
  can't be captured for 1 move), **extra move**, **teleport**. The piece that lands
  on the square gets the effect immediately.
- Boost rules are unit-testable without a database or Nest runtime.

## Non-goals

- Matchmaking, ratings, accounts beyond a minimal player identity.
- AI opponent, analysis, game history UI.
- Configurable / user-defined boost types.

## Technical decisions

- pnpm monorepo: `apps/web` (Nuxt 4 + Nuxt UI), `apps/server` (NestJS + `@nestjs/websockets`).
- Server: Feature-first by bounded context (`game`, `boost`), light Clean inside;
  BCs talk only via `shared/events` (`MoveMade`, `BoostSquareSpawned`, `BoostApplied`)
  — see ADR 0001.
- PostgreSQL via docker compose, Drizzle ORM; Jest; dependency-cruiser enforces the rule.

## Acceptance criteria

- After the 7th, 14th, 21st, … half-move exactly one boost appears on an empty square:
  `boost` publishes `BoostSquareSpawned`, `game` relays it, and both clients see it.
- Landing on a boost square applies its effect in the same move and emits `BoostApplied`.
- `make test` passes with boost domain tests that use no DB; `make arch` reports 0 violations.

## Open questions

- `boost` can't read `Board`: `MoveMade` must carry enough state (FEN or occupied
  squares + half-move number) to find a free square.
- Extra move / teleport change the game state, so `game` must subscribe to
  `BoostApplied` and validate the result (check after teleport? can the king teleport?).
- Invulnerability vs. check: can an invulnerable king ignore check? Can an extra
  move deliver mate?
