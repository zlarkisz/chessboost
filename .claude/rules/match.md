---
paths: ["apps/server/src/match/**"]
---

# match context

Owns matchmaking: pairing two players into one game by time control and rating.

## Boundaries

- Publishes `MatchCreated` when two players are paired into one game.
- Reacts to `RatingChanged` (from `player`).
- TODO: queue rules, time-control set, rating window for pairing.

## Prohibitions

- No imports from `src/player/**`, `src/game/**` or any other context — only `shared/events`.
- TODO: context-specific prohibitions.
