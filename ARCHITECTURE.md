# Architecture

## Pattern

Feature-first by bounded context: one Nest module per BC in `apps/server/src/<bc>/`.
Inside each BC — light Clean Architecture with four layers:

| Layer            | Contains                                                         |
| ---------------- | ---------------------------------------------------------------- |
| `domain`         | entities, value objects, rules, ports (abstract classes) — pure TS |
| `application`    | use cases; publishes / handles integration events                |
| `infrastructure` | Drizzle repositories and other port implementations              |
| `presentation`   | HTTP controllers, WebSocket gateway, DTOs                        |

`<bc>.module.ts` is the composition root: it binds ports to implementations
(`{ provide: BoostRepository, useClass: DrizzleBoostRepository }`).

Bounded contexts:

- **game** — chess rules: `Game`, `Board`, `Piece`, `Move`, `Clock`.
- **boost** — `BoostSquare`, `BoostType`, `Effect`, `SpawnRule`.

## Dependency rule

```
presentation → application → domain ← infrastructure
                    ↓
              shared/events
```

- `domain` imports nothing outside itself — no `@nestjs/*`, no npm, no `shared/`.
- `application` → `domain`, `shared/events`.
- `infrastructure` implements ports from `domain`.
- `presentation` → `application` (+ `domain` types).
- BC ↔ BC only via `shared/events`. Enforced by `apps/server/.dependency-cruiser.cjs`
  (`make arch`).

## Contexts and events

```mermaid
flowchart LR
  subgraph game["game BC"]
    GP[presentation<br/>GameGateway] --> GA[application]
    GA --> GD[domain<br/>Game · Board · Piece · Move · Clock]
    GI[infrastructure] -.implements ports.-> GD
  end

  subgraph boost["boost BC"]
    BA[application] --> BD[domain<br/>BoostSquare · BoostType · Effect · SpawnRule]
    BI[infrastructure] -.implements ports.-> BD
  end

  subgraph shared["shared/events"]
    MM([MoveMade])
    BAp([BoostApplied])
  end

  GA -- publishes --> MM
  MM -- handled by --> BA
  BA -- publishes --> BAp
  BAp -- handled by --> GA
  GI & BI --> DB[(PostgreSQL)]
```

`game` publishes `MoveMade` after every legal move; `boost` counts moves, spawns a
boost every 5 moves, and when a piece lands on a boost square publishes
`BoostApplied`; `game` applies the effect to the board and re-validates the position.
