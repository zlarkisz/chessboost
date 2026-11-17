---
id: T9
title: "Build the per-game command queue and pipeline with MakeHalfMove and GetSnapshot"
layer: "app"
deps: ["T8"]
acs: ["AC-01", "AC-02", "AC-04", "AC-10", "AC-27b", "AC-29"]
files_hint: ["apps/server/src/game/application/command-queue/", "apps/server/src/game/application/make-half-move.ts", "apps/server/src/game/application/get-snapshot.ts"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T9 — Build the per-game command queue and pipeline with MakeHalfMove and GetSnapshot

## Why

One queue per game, persist before broadcast, and idempotent `commandId` ([ADR-0003](../adr/0003-persist-each-action-before-broadcast-with-per-game-queue.md)). Authorization per [sad §8](../sad.md). Flow: `Critical flow 1`.

**ACs:** AC-01, AC-02, AC-04, AC-10, AC-27b, AC-29 ([PRD §5](../PRD.md)) · **Blocked by:** T8 · **Estimate:** L

## What

- `GameCommandQueue`: one ordered chain per `gameId`.
- Pipeline steps:
  - authorize: the person is one of the two players. A missing game and someone else's game return the same `game.not_found` (AC-04);
  - idempotency by `commandId`;
  - load → domain → save in one transaction;
  - after commit: notify a `GameBroadcaster` port (implemented by the gateway in T14) and hand the events to the publisher (T11).
- Use cases `MakeHalfMove` and `GetSnapshot`. The snapshot read model has clocks minus the elapsed time, `abortRemainingMs`, `lastMoveUci` and `drawBlocked`; the rematch fields stay null until T16.
- Arm hook for the timer (T10).

**Files:** `apps/server/src/game/application/command-queue/`, `apps/server/src/game/application/make-half-move.ts`, `apps/server/src/game/application/get-snapshot.ts`

## Definition of Done

- [ ] Application tests with a fake `TimeSource` and an in-memory repository pass for:
  - two commands for one game run strictly in order;
  - the same `commandId` twice gives one half-move and the same ack;
  - a non-player and a non-existent game get an identical error;
  - a move racing the deadline is decided by game time (AC-10).
- [ ] lint + typecheck clean

## Notes

- The snapshot read model is application-level. The presentation layer maps it to `GameSnapshot` from `@chessboost/contracts`.
