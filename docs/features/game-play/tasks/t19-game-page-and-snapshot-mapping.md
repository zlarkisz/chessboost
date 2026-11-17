---
id: T19
title: "Add the /game/[id] page that maps GameSnapshot to GameView, with skeleton and presence"
layer: "ui"
deps: ["T18"]
acs: ["AC-06", "AC-27", "AC-30", "AC-31", "AC-33"]
files_hint: ["apps/web/app/pages/game/[id].vue", "apps/web/app/lib/snapshot-to-view.ts", "apps/web/app/types/game.ts", "apps/web/app/components/game/PlayerClock.vue"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T19 — Add the /game/[id] page that maps GameSnapshot to GameView, with skeleton and presence

## Why

Reuse `GameScreen` / `GameBoard` / `PlayerClock` and the role tokens ([sad §4](../sad.md), [architecture-map](../../../architecture-map.md) §Frontend). Flow: `Open a game`.

**ACs:** AC-06, AC-27, AC-30, AC-31, AC-33 ([PRD §5](../PRD.md)) · **Blocked by:** T18 · **Estimate:** M

## What

- Client-only page `pages/game/[id].vue`, modelled on `pages/game/demo.vue`.
- `snapshotToView`:
  - FEN → pieces and side to move;
  - `lastMoveUci` → last move;
  - nickname, and rating only when present;
  - board orientation from `you`;
  - clocks, presence markers, and the `abortRemainingMs` countdown in place of the main clock.
- Skeleton (empty board, inactive clocks) until the first snapshot. A not-found state for `game.not_found`.
- `GameView` gets an optional rating and presence. Boost fields stay empty. `MoveList` is hidden (PRD §3 non-goal).

**Files:** `apps/web/app/pages/game/[id].vue`, `apps/web/app/lib/snapshot-to-view.ts`, `apps/web/app/types/game.ts`, `apps/web/app/components/game/PlayerClock.vue`

## Definition of Done

- [ ] `snapshotToView` unit tests (FEN fixtures, missing rating, Black orientation) pass.
- [ ] Component tests pass:
  - skeleton before the first snapshot;
  - offline marker next to the opponent;
  - abort countdown shown instead of the main clock.
- [ ] Typecheck is green.
- [ ] lint + typecheck clean

## Notes

- Role tokens only, never palette values (`docs/design/design-system.md`). Follow `.claude/rules/web-design.md`.
