---
id: T6
title: "Add resign, cancel and draw offers to the Game aggregate"
layer: "domain"
deps: ["T5"]
acs: ["AC-11", "AC-13", "AC-14", "AC-14b", "AC-15", "AC-16", "AC-20", "AC-32b"]
files_hint: ["apps/server/src/game/domain/game.ts", "apps/server/src/game/domain/draw-offer.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T6 — Add resign, cancel and draw offers to the Game aggregate

## Why

Domain rules for [PRD US-03, US-04, US-09](../PRD.md). Flows: [sad §6](../sad.md) `Resign with confirmation`, `Offer and answer a draw` and `Abort a game nobody started`.

**ACs:** AC-11, AC-13, AC-14, AC-14b, AC-15, AC-16, AC-20, AC-32b ([PRD §5](../PRD.md)) · **Blocked by:** T5 · **Estimate:** M

## What

- `resign`: allowed only after both sides have made their own first half-move. Before that → `game.not_started` (AC-32b).
- `cancel`: allowed only in the abort window, otherwise `game.cancel_not_allowed`. The game is aborted with no result.
- `offerDraw`:
  - the side is blocked after a declined offer until its own next half-move (`game.draw_offer_blocked`, retry after `own_half_move`);
  - if the opponent's offer is already waiting, the game ends as a Draw by agreement (AC-16);
  - repeating its own offer is a no-op.
- `acceptDraw` / `declineDraw`: with no waiting opponent offer → `game.no_offer`.
- The opponent's half-move clears a waiting offer and marks it declined (AC-14). A game end clears it as well.

**Files:** `apps/server/src/game/domain/game.ts`, `apps/server/src/game/domain/draw-offer.ts`

## Definition of Done

- [ ] Unit tests for each listed AC, including:
  - concurrent offers produce exactly one Draw by agreement;
  - a second offer before the own next half-move is blocked;
  - resign in the abort window is refused;
  - cancel after both first half-moves is refused.
- [ ] `make arch` is green.
- [ ] lint + typecheck clean

## Notes

- Runs after T5 in the same lane (`domain/game.ts`).
