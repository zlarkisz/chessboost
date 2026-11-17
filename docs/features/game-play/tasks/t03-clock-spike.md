---
id: T3
title: "Spike the deadline clock: TimeControl, Clock and the TimeSource port"
layer: "domain"
deps: ["T1"]
acs: ["AC-07", "AC-10", "AC-32", "AC-33"]
files_hint: ["apps/server/src/game/domain/clock/", "apps/server/src/game/domain/ports/time-source.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T3 — Spike the deadline clock: TimeControl, Clock and the TimeSource port

## Why

The clock spike runs first ([PRD §8](../PRD.md), [sad §11](../sad.md)). Model: [ADR-0004](../adr/0004-deadline-clock-with-per-game-timer-rearmed-on-boot.md). Covers [PRD AC-07, AC-10, AC-32, AC-33](../PRD.md).

**ACs:** AC-07, AC-10, AC-32, AC-33 ([PRD §5](../PRD.md)) · **Blocked by:** T1 · **Estimate:** M

## What

- `TimeControl` (base, increment). Abort window: 20 s for Blitz (3+2, 5+0) and 60 s for Rapid (10+0), chosen by base time ([PRD §1](../PRD.md)).
- `Clock` value object holding the remaining ms per side and `turnStartedAt`.
- Deadline: `turnStartedAt` + remaining time, or `turnStartedAt` + the abort window before the side to move has made its own first half-move. White's window starts at creation; Black's starts after White's first half-move.
- `applyHalfMove(at)`: subtract the elapsed time and add the increment after every half-move, the first one included.
- `isExpired(at)`: the decision uses the game's own time.
- `TimeSource` port (abstract class).
- Pure TypeScript, no npm imports.

**Files:** `apps/server/src/game/domain/clock/`, `apps/server/src/game/domain/ports/time-source.ts`

## Definition of Done

- [ ] Unit tests with a fake `TimeSource`:
  - 3+2 shows 3:02 after the first half-move (AC-07);
  - a half-move 1 ms before the deadline counts; one at or after the deadline is expired (AC-10);
  - before a side's own first half-move its main clock does not run and the deadline is the abort window (AC-33);
  - the abort windows are 20 s for 3+2 / 5+0 and 60 s for 10+0 (AC-32).
- [ ] `make arch` is green (domain imports nothing external).
- [ ] lint + typecheck clean

## Notes

- Scope-cut checkpoint ([PRD §8](../PRD.md)): if the timeout scripted game is still red at the end of implementation week 1, decide whether to cut Approach A. Owner: Gleb Bufin.
- Runs in parallel with T4, T7, T12 and T13.
