# boost

Boost mechanics: spawn a boost on a free square after every 7th half-move, apply its effect when a piece lands on it, expire it.

- **Status:** scaffolded
- **Vocabulary:** BoostSquare, BoostType, Effect, SpawnRule, Duration
- **Publishes:** BoostSquareSpawned, BoostSquareExpired, BoostApplied, BoostExpired
- **Listens to:** MoveMade (from game)

Talks to other contexts only via `shared/events` — never imports them directly.
Layers: `domain/`, `application/`, `infrastructure/`, `presentation/` + `boost.module.ts`.
See `docs/bc-map.md` for the full map.
