---
id: T5
title: "Build the Game aggregate: creation, half-moves, game-end precedence, material rules and time checks"
layer: "domain"
deps: ["T3", "T4"]
acs: ["AC-01", "AC-02", "AC-03", "AC-06", "AC-08", "AC-09", "AC-17", "AC-18", "AC-19", "AC-20", "AC-28", "AC-32", "AC-33"]
files_hint: ["apps/server/src/game/domain/game.ts", "apps/server/src/game/domain/end-reason.ts", "apps/server/src/game/domain/material.ts", "apps/server/src/game/domain/errors.ts"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T5 — Build the Game aggregate: creation, half-moves, game-end precedence, material rules and time checks

## Why

The aggregate owns position, clocks, status and game ends ([sad §5](../sad.md) domain, [data-model](../data-model.md) `games` / `half_moves`). The flows are [sad §6](../sad.md) `Critical flow 1`, `A half-move ends the game` and `Abort a game nobody started`.

**ACs:** AC-01, AC-02, AC-03, AC-06, AC-08, AC-09, AC-17, AC-18, AC-19, AC-20, AC-28, AC-32, AC-33 ([PRD §5](../PRD.md)) · **Blocked by:** T3, T4 · **Estimate:** L

## What

- Create a game from pairing data: players snapshot (id, nickname, rating?), colours, time control, status `active`, the start position.
- `makeHalfMove(colour, uci, at)`, in this order:
  - turn check;
  - clock expiry (T3);
  - legality via `ChessRules`;
  - append the half-move, apply the increment;
  - detect a game end with precedence Mate > stalemate > insufficient material > repetition > 50-move rule.
- Insufficient material per the AC-18 list, including same-colour vs opposite-colour bishops (AC-19). `canMateByMaterial(side)` for AC-09.
- `checkTime(at)` → Timeout with a winner, `timeout_vs_insufficient_material`, or aborted when a side never made its own first half-move.
- Typed errors (`NotYourTurn`, `IllegalMove`, `GameOver`, …) matching the events.md codes.
- An ended or aborted game refuses every action (AC-20).

**Files:** `apps/server/src/game/domain/game.ts`, `apps/server/src/game/domain/end-reason.ts`, `apps/server/src/game/domain/material.ts`, `apps/server/src/game/domain/errors.ts`

## Definition of Done

- [ ] Unit tests, one or more per AC:
  - AC-01: the turn switches;
  - AC-02: an illegal or out-of-turn move leaves position and clocks unchanged;
  - AC-03: promotion;
  - AC-17: mate;
  - AC-18: each draw reason, plus precedence when two trigger on one half-move;
  - AC-19: same-colour bishops draw, opposite-colour bishops continue;
  - AC-08 / AC-09: timeout win vs draw (K+N vs K+Q is a win);
  - AC-32 / AC-33: abort before a side's own first half-move;
  - AC-20: actions after the end are refused.
- [ ] `make arch` is green.
- [ ] lint + typecheck clean

## Notes

- Tests may use `ChessJsRules` (T4) as the port implementation. That is a test-only import.
- Shares `domain/game.ts` with T6, so the two tasks run in sequence.
