---
id: T12
title: "Add the in-memory PresenceRegistry that counts a player's tabs per game"
layer: "app"
deps: ["T1"]
acs: ["AC-24", "AC-31"]
files_hint: ["apps/server/src/game/application/presence-registry.ts"]
owner: "Gleb Bufin"
estimate: "S"
status: "todo"
---

# T12 — Add the in-memory PresenceRegistry that counts a player's tabs per game

## Why

Presence is owned by game and kept in memory ([ADR-0007](../adr/0007-game-context-owns-rematch-and-presence.md)). Covers [PRD AC-24, AC-31](../PRD.md).

**ACs:** AC-24, AC-31 ([PRD §5](../PRD.md)) · **Blocked by:** T1 · **Estimate:** S

## What

- `connect(gameId, playerId, connectionId)` / `disconnect(...)`.
- A player is online while at least one connection is open.
- Emits online/offline transitions only.
- `isOnline(gameId, playerId)` (used by rematch accept, T16).

**Files:** `apps/server/src/game/application/presence-registry.ts`

## Definition of Done

- [ ] Unit tests pass for:
  - two tabs, one closes → still online;
  - both close → exactly one offline transition;
  - a reconnect → online;
  - separate games are independent.
- [ ] lint + typecheck clean

## Notes

- Lost on restart by design. It rebuilds as clients reconnect ([sad §11](../sad.md)).
