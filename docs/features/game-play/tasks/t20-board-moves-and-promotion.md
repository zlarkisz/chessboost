---
id: T20
title: "Send half-moves from the board, roll back rejected ones, add the promotion picker and the move sound"
layer: "ui"
deps: ["T19"]
acs: ["AC-01", "AC-02", "AC-03"]
files_hint: ["apps/web/app/components/game/GameBoard.vue", "apps/web/app/components/game/PromotionPicker.vue", "apps/web/public/sounds/"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T20 — Send half-moves from the board, roll back rejected ones, add the promotion picker and the move sound

## Why

Covers [PRD AC-01..03](../PRD.md). Flows: `Critical flow 1` and `Promote a pawn`.

**ACs:** AC-01, AC-02, AC-03 ([PRD §5](../PRD.md)) · **Blocked by:** T19 · **Estimate:** M

## What

- `GameBoard` drag/click → `useGame.move(uci)`. A rejected ack returns the piece.
- A new `PromotionPicker`, composed from `Button` + tokens, since no existing primitive fits:
  - choosing a piece sends `e7e8n` etc.;
  - closing it returns the pawn and sends nothing.
- The move sound plays once per new `halfMoveCount`, for both sides' moves.

**Files:** `apps/web/app/components/game/GameBoard.vue`, `apps/web/app/components/game/PromotionPicker.vue`, `apps/web/public/sounds/`

## Definition of Done

- [ ] Component tests pass:
  - a rejected ack puts the piece back;
  - a promotion choice emits the right UCI;
  - closing the picker emits nothing;
  - the sound plays once per new half-move.
- [ ] lint + typecheck clean

## Notes

- Does not touch `GameScreen.vue`, so it can run in parallel with T21 and T22.
