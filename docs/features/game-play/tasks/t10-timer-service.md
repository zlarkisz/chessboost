---
id: T10
title: "Add TimerService: one timer per game, CheckTime, re-arm on boot and the 5 s safety sweep"
layer: "app"
deps: ["T9"]
acs: ["AC-08", "AC-09", "AC-28", "AC-29b", "AC-32", "AC-33"]
files_hint: ["apps/server/src/game/application/timer-service.ts", "apps/server/src/game/application/check-time.ts", "apps/server/src/game/domain/ports/game-scheduler.ts", "apps/server/src/game/infrastructure/node-timer-scheduler.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T10 — Add TimerService: one timer per game, CheckTime, re-arm on boot and the 5 s safety sweep

## Why

Deadline clock with one timer per game, re-armed on boot ([ADR-0004](../adr/0004-deadline-clock-with-per-game-timer-rearmed-on-boot.md)). Flows: `Critical flow 2` and `Abort a game nobody started`.

**ACs:** AC-08, AC-09, AC-28, AC-29b, AC-32, AC-33 ([PRD §5](../PRD.md)) · **Blocked by:** T9 · **Estimate:** M

## What

- `GameScheduler` port + `NodeTimerScheduler`.
- `CheckTime` runs through the game queue.
- Arm a timer after every accepted action at the new deadline.
- `rearmAll()` on boot: a deadline that is already past is enqueued now.
- A safety sweep every 5 s catches any overdue active game and logs WARN.
- Log the timeout lateness (game-end time minus the deadline).

**Files:** `apps/server/src/game/application/timer-service.ts`, `apps/server/src/game/application/check-time.ts`, `apps/server/src/game/domain/ports/game-scheduler.ts`, `apps/server/src/game/infrastructure/node-timer-scheduler.ts`

## Definition of Done

- [ ] Tests with a fake scheduler and fake time pass for:
  - a passing deadline gives exactly one Timeout;
  - after a simulated restart (a new `TimerService` over the same repository with a past deadline), the game ends exactly once;
  - the sweep catches a lost timer and logs WARN;
  - a timeout against insufficient mating material is a Draw;
  - an expired abort window aborts the game.
- [ ] lint + typecheck clean

## Notes

- Feeds the PRD §6 timeout-precision measurement (≤ 1 s).
