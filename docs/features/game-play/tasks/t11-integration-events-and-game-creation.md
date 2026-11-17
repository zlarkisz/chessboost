---
id: T11
title: "Publish integration events after commit and create games from MatchCreated"
layer: "app"
deps: ["T9"]
acs: ["AC-06", "AC-21", "AC-22b", "AC-25b", "AC-32", "AC-34"]
files_hint: ["apps/server/src/shared/events/", "apps/server/src/game/application/event-publisher.ts", "apps/server/src/game/application/create-game-from-pairing.ts", "apps/server/src/game/infrastructure/in-process-event-publisher.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T11 — Publish integration events after commit and create games from MatchCreated

## Why

In-process bus, publish after commit, isolated handlers ([ADR-0006](../adr/0006-in-process-event-bus-published-after-commit.md)). Contracts: [events.md](../contracts/events.md) Part 2. Flow: `Create a game from a pairing`.

**ACs:** AC-06, AC-21, AC-22b, AC-25b, AC-32, AC-34 ([PRD §5](../PRD.md)) · **Blocked by:** T9 · **Estimate:** M

## What

- `shared/events`: `MatchCreated`, `GameStarted`, `MoveMade`, `GameEnded`, `GameNotStarted`, with the camelCase `{type, version, occurredAt, data}` envelope.
- `EventPublisher` port in `application` (see the [sad §5](../sad.md) override note) and the in-process adapter. Handler errors are logged and never propagate.
- `MatchCreated` handler → `CreateGameFromPairing`, in one transaction:
  - insert the game and `player_active_games`;
  - close the open rematch offers of both players (AC-25b);
  - after commit, arm the abort timer (the window starts at creation, AC-32) and publish `GameStarted`.
- A unique violation → `GameNotStarted { matchId, reason }`.
- Publish `MoveMade` after each accepted half-move. Publish `GameEnded` once per game end, never for an abort (AC-34).

**Files:** `apps/server/src/shared/events/`, `apps/server/src/game/application/event-publisher.ts`, `apps/server/src/game/application/create-game-from-pairing.ts`, `apps/server/src/game/infrastructure/in-process-event-publisher.ts`

## Definition of Done

- [ ] Tests pass for:
  - `MatchCreated` creates one game with the right players and time control, and `GameStarted` follows the commit;
  - a player with an active game gets `GameNotStarted` and no game is created;
  - a throwing consumer does not fail the action;
  - an aborted game publishes no `GameEnded`;
  - `GameEnded` is published once.
- [ ] `make arch` is green: no cross-context imports.
- [ ] lint + typecheck clean

## Notes

- Open question ([sad §11](../sad.md)): a storage failure while handling `MatchCreated` has no owner yet. Log it here; do not invent a retry.
