---
id: T21
title: "Wire GameActions: resign with confirmation, the draw offer states and Cancel in the abort window"
layer: "ui"
deps: ["T19"]
acs: ["AC-11", "AC-12", "AC-13", "AC-14", "AC-14b", "AC-15", "AC-32b"]
files_hint: ["apps/web/app/components/game/GameActions.vue", "apps/web/app/components/game/GameScreen.vue"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T21 — Wire GameActions: resign with confirmation, the draw offer states and Cancel in the abort window

## Why

Reuse `GameActions` and `AlertDialog` ([architecture-map](../../../architecture-map.md) §Frontend). Covers [PRD US-03, US-04, AC-32b](../PRD.md).

**ACs:** AC-11, AC-12, AC-13, AC-14, AC-14b, AC-15, AC-32b ([PRD §5](../PRD.md)) · **Blocked by:** T19 · **Estimate:** M

## What

- Abort window: only Cancel is shown.
- Otherwise:
  - Resign (soft red) opens an `AlertDialog`; full red appears only in the dialog;
  - Offer draw is secondary / tonal.
- Draw states:
  - an opponent offer is waiting → Accept / Decline;
  - the own offer is waiting → shown as offered;
  - declined → a notice;
  - `game.draw_offer_blocked` → the message «you can offer a draw again after your next half-move».

**Files:** `apps/web/app/components/game/GameActions.vue`, `apps/web/app/components/game/GameScreen.vue`

## Definition of Done

- [ ] Component tests pass:
  - the abort window shows only Cancel;
  - resign emits only after confirming;
  - cancelling the dialog emits nothing (AC-12);
  - each draw state renders;
  - the blocked message is shown.
- [ ] lint + typecheck clean

## Notes

- Shares `GameScreen.vue` with T22, so the two run in sequence.
- UI copy comes from `docs/design/`.
