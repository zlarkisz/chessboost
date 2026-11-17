---
id: T17
title: "Bind game.module, re-arm timers on boot and add the temporary create-pairing CLI"
layer: "wiring"
deps: ["T10", "T11", "T15", "T16"]
acs: ["AC-06", "AC-29b"]
files_hint: ["apps/server/src/game/game.module.ts", "apps/server/src/app.module.ts", "apps/server/src/match/match.module.ts", "apps/server/src/match/presentation/create-pairing.cli.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T17 — Bind game.module, re-arm timers on boot and add the temporary create-pairing CLI

## Why

The composition root binds the ports ([ARCHITECTURE.md](../../../../ARCHITECTURE.md)). The temporary pairing CLI lives in match ([sad §5](../sad.md), [sad §11](../sad.md)).

**ACs:** AC-06, AC-29b ([PRD §5](../PRD.md)) · **Blocked by:** T10, T11, T15, T16 · **Estimate:** M

## What

- `game.module.ts` binds every port to its implementation.
- `OnApplicationBootstrap` → `TimerService.rearmAll()`.
- `match/presentation` gets a dev-only `create-pairing` CLI:
  - runs inside the server container only;
  - reads nicknames from the allowlist mapping;
  - publishes `MatchCreated` through `shared/events`;
  - exposes no HTTP or WebSocket endpoint.

**Files:** `apps/server/src/game/game.module.ts`, `apps/server/src/app.module.ts`, `apps/server/src/match/match.module.ts`, `apps/server/src/match/presentation/create-pairing.cli.ts`

## Definition of Done

- [ ] `make arch` is green: match does not import game.
- [ ] The server boots against the local PostgreSQL and logs how many games it re-armed.
- [ ] `create-pairing` creates a game that both players can `game:join`.
- [ ] A boot test with an overdue game ends it exactly once.
- [ ] lint + typecheck clean

## Notes

- The CLI is removed when the match feature ships ([sad §11](../sad.md)).
