# ADR 0001 — Initial setup: Feature-first + light Clean

- Status: accepted
- Date: 2026-10-18

## Context

- One developer, about 10 entities across two areas: chess rules and boosts.
- Boost logic (spawn after every 7th half-move, free-square choice, effects) is the core of
  the product and must be tested fast, without a database or the Nest runtime.
- Stack is fixed: NestJS + Drizzle + PostgreSQL, Nuxt on the client.

## Decision

Organise the server by bounded context (`game`, `boost`) — one Nest module each.
Inside every BC use four light layers: `domain` (pure TS, ports as abstract
classes), `application`, `infrastructure`, `presentation`. BCs communicate only
through integration events in `shared/events`. Rules are enforced by
dependency-cruiser.

## Alternatives considered

- **Layered (controllers / services / repositories at the top level).** Rejected:
  boost and chess logic would mix in shared services that call Drizzle directly,
  so testing boosts requires a DB or heavy mocks; the boundary between the two
  areas would erode.
- **Full Hexagonal (explicit inbound/outbound ports and adapters for every
  interaction).** Rejected: too much ceremony for one developer and ~10 entities;
  most use cases would have a port with a single adapter. We keep only the useful
  part — outbound ports (repositories) in `domain`.

## Consequences

- Boost domain is tested with plain Jest, no DB.
- Adding a BC = a new folder + module; cross-BC coupling is visible as events.
- Events must carry enough data (e.g. board state in `MoveMade`), since BCs
  can't read each other's models.
- Abstract-class ports are a Nest-friendly compromise: they act as DI tokens
  without importing `@nestjs/*` into `domain`.
