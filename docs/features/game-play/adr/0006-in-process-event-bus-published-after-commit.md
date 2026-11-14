---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0006 — Publish integration events on an in-process bus after the transaction commits

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

Bounded contexts talk only through `shared/events` (`docs/adr/0001-initial-setup.md`, `docs/bc-map.md`). game-play is the first feature to publish integration events: `GameStarted`, `MoveMade` (position + half-move number, for boost), `GameEnded` (for rating, once per game end — AC-21), and it consumes `MatchCreated`. All contexts run in one Nest process and the stack has no broker (sad.md §2). The consumers of `MoveMade` and `GameEnded` do not exist yet. The shape of this bus becomes the contract for every future context.

## Decision drivers

- AC-21: a game counts once in the results the rating feature will use.
- Boosts need `MoveMade` immediately (a boost spawns right after the 13th half-move).
- Constraint (§2): one process, no broker; one developer.
- QG-1: a consumer must never be able to break or change a player's action.

## Considered options

1. **In-process bus, published after commit** — a thin `EventPublisher` port in each context's `application`, one in-memory implementation (e.g. `@nestjs/event-emitter`); events carry `gameId` + half-move number so a consumer can drop duplicates.
2. **Transactional outbox** — events written to an outbox table in the same transaction; a background dispatcher delivers them (at-least-once).

## Decision outcome

**Chosen:** Option 1. No infrastructure, milliseconds of latency, and the outbox can replace the port's implementation later without changing event contracts. Losing an event in a crash between commit and publish is acceptable now: there are no consumers yet, and `GameEnded` is recoverable from the game table.

Details fixed by this decision:

- Events are published only after the game-play ADR-0003 transaction commits.
- **(a) Handlers are isolated:** delivery is asynchronous with error capture; a consumer's failure is logged and never propagates back to the player's action.
- The `EventPublisher` port lives in `application`, not `domain`: it speaks `shared/events` types, which `domain` may not import (`domain-only-own-domain`); this is the one exception to «ports in domain» (sad.md §5 Override note).
- **`MatchCreated` carries, per player, `playerId` + nickname + optional rating**, besides the time control and colours; game stores them as a snapshot on the game and reuses them for a rematch (AC-06, AC-30). The Cloudflare Access email (game-play ADR-0008) never enters any event — it stays inside the `CurrentPerson` adapter (PRD §6.1).
- **(b) New event `GameNotStarted { matchId, reason }`** — published when a game cannot be created from `MatchCreated` (e.g. a player already has an active game, AC-22b). Added to the `shared/events` list; `docs/bc-map.md` needs the same entry.

## Consequences

**Positive**
- Zero new infrastructure; contracts in `shared/events` are the same whatever transport sits behind the port.
- A slow or failing consumer cannot slow down or fail a half-move.

**Negative**
- At-most-once: a crash between commit and publish loses that event.
- Consumers must be idempotent by `gameId` + half-move number.

**Neutral**
- **(c) Migration triggers** (sad.md §11): switch to a transactional outbox at the architecture-design of the boosts or rating feature; move to a broker (Kafka / RabbitMQ) when there is more than one server process or a context is extracted into its own service.

## Links

- PRD: [[../PRD.md]] AC-21, AC-22b; §1 Traceability (context boundaries)
- SAD: [[../sad.md]] §3, §4, §11
- Repo ADR: `docs/adr/0001-initial-setup.md`; map: `docs/bc-map.md`
- Related ADR: [[0003-persist-each-action-before-broadcast-with-per-game-queue]]
