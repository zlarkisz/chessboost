---
paths: ["apps/server/src/boost/**"]
---

# boost context

Owns boost mechanics: spawning a boost square after every 7th half-move (each side's
move counts separately), applying its effect when a piece lands on it, expiring it.

## Boundaries

- Knows nothing about the board or chess rules. Everything it needs about the position
  (free squares, half-move number) must arrive in the `MoveMade` payload.
- Decides *that* an effect applies (`BoostApplied`); `game` decides *how* the board
  changes and re-validates the position. Never mutate game state from here.
- Publishes only `BoostSquareSpawned`, `BoostSquareExpired`, `BoostApplied`,
  `BoostExpired`; listens only to `MoveMade`.

## Prohibitions

- No imports from `src/game/**` or any other context — only `shared/events`.
- No `Math.random()` / `crypto` in `domain/` — take randomness through a port so spawn
  logic is deterministic in tests.
- Spawn interval and boost set live in `domain/` (`SpawnRule`, `BoostType`) — not in
  presentation, config files or the database.
