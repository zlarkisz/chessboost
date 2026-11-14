# ADR 0003 — UUID v7 for entity IDs

- Status: accepted
- Date: 2026-11-14

## Context

- game-play is the first feature that persists entities: games need IDs, and every client action carries a `commandId` for idempotency (`docs/features/game-play/adr/0003-persist-each-action-before-broadcast-with-per-game-queue.md`).
- IDs leave their context: they travel in `shared/events` (`GameStarted`, `MoveMade`, `GameEnded`, `GameNotStarted`, `MatchCreated`) and will be stored by player, match and boost.
- A game link contains the game ID; a link must not reveal whether a game exists or let someone guess other games (game-play PRD AC-04, §6.1).
- PostgreSQL 17 (`docker-compose.yml`) has a native `uuid` column type but no built-in UUID v7 generator (that arrives in PostgreSQL 18).
- Changing the ID format later means migrating every table and every event consumer — weeks of work across all contexts.

## Decision

All entity IDs in chessboost are UUID v7 (RFC 9562), stored in PostgreSQL `uuid` columns. IDs are generated in the application layer of the owning context, before the insert, so a use case knows the ID without a database round trip; the domain receives an ID through a port and never generates one itself. Client-generated request IDs (such as `commandId`) are also UUIDs.

## Alternatives considered

- **UUID v4 (fully random).** Rejected: random values scatter inserts across the B-tree index of the primary key, and IDs carry no creation order, so «latest games» needs a separate timestamp index; v7 keeps the same uniqueness and non-guessability with a time-ordered prefix.
- **Auto-increment integer (`bigserial`).** Rejected: sequential IDs in game links are guessable and reveal how many games exist (against AC-04), and the ID is known only after the insert.
- **ULID.** Rejected: same ordering benefits as v7 but not a UUID standard — PostgreSQL has no native type for it, so it would be stored as text and parsed by hand.

## Consequences

- Every context uses one ID type in tables and in `shared/events`; no translation between formats.
- Primary-key inserts stay index-friendly and IDs sort roughly by creation time.
- A small UUID v7 generator (library or helper) is needed in the application layer until PostgreSQL 18; it sits behind a port so `domain` keeps importing nothing external.
- The creation time is readable from an ID's prefix — acceptable, since the two players of a game already know when it started; authorization (AC-04), not ID secrecy, protects games.
