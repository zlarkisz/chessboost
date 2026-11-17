---
id: T15
title: "Wire resign, cancel and the draw actions end to end: use cases and gateway handlers"
layer: "ports"
deps: ["T14"]
acs: ["AC-11", "AC-13", "AC-14", "AC-14b", "AC-15", "AC-16", "AC-20", "AC-32b"]
files_hint: ["apps/server/src/game/application/resign.ts", "apps/server/src/game/application/cancel-game.ts", "apps/server/src/game/application/draw.ts", "apps/server/src/game/presentation/game.gateway.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T15 — Wire resign, cancel and the draw actions end to end: use cases and gateway handlers

## Why

Vertical slice over the T6 domain rules. Actions `game:resign`, `game:cancel`, `game:offer_draw`, `game:accept_draw`, `game:decline_draw` ([events.md](../contracts/events.md)).

**ACs:** AC-11, AC-13, AC-14, AC-14b, AC-15, AC-16, AC-20, AC-32b ([PRD §5](../PRD.md)) · **Blocked by:** T14 · **Estimate:** M

## What

- Use cases through the pipeline: `Resign`, `CancelGame`, `OfferDraw`, `AcceptDraw`, `DeclineDraw`.
- The 5 gateway handlers with DTOs and error mapping.

**Files:** `apps/server/src/game/application/resign.ts`, `apps/server/src/game/application/cancel-game.ts`, `apps/server/src/game/application/draw.ts`, `apps/server/src/game/presentation/game.gateway.ts`

## Definition of Done

- [ ] Socket integration tests pass for:
  - resign → both clients get the ended snapshot with `resign`;
  - offer then accept → `draw_agreement`;
  - a re-offer before the own next half-move → `game.draw_offer_blocked` with `retryAfter = own_half_move`;
  - two simultaneous offers end the game exactly once;
  - resign in the abort window → `game.not_started`;
  - cancel → aborted with no result.
- [ ] lint + typecheck clean

## Notes

- This task holds both the app and the ports pieces, a deliberate vertical slice.
