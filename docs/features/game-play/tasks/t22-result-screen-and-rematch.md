---
id: T22
title: "Add the result screen with end-reason texts, the aborted state, Rematch and New game"
layer: "ui"
deps: ["T19"]
acs: ["AC-09", "AC-17", "AC-18", "AC-19", "AC-21", "AC-22", "AC-22b", "AC-23", "AC-24", "AC-24b", "AC-25", "AC-25b", "AC-26", "AC-32", "AC-34"]
files_hint: ["apps/web/app/components/game/GameResult.vue", "apps/web/app/components/game/GameScreen.vue"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T22 — Add the result screen with end-reason texts, the aborted state, Rematch and New game

## Why

Covers [PRD US-05, US-06, US-09](../PRD.md). Flows: `Rematch accepted` and `Rematch offer kept or withdrawn`.

**ACs:** AC-09, AC-17, AC-18, AC-19, AC-21, AC-22, AC-22b, AC-23, AC-24, AC-24b, AC-25, AC-25b, AC-26, AC-32, AC-34 ([PRD §5](../PRD.md)) · **Blocked by:** T19 · **Estimate:** L

## What

- New `GameResult`, composed from `Card` + `Button`, since no existing screen fits. It shows the winner and the reason for all 9 end reasons, including «time ran out but the opponent could not checkmate».
- Aborted: «aborted», no result, only New game.
- Rematch states: offer, waiting, accept / decline, cancel.
- The opponent offline marker. Accept is disabled while the offerer is offline.
- An accepted rematch navigates to `rematchGameId`.
- New game closes the own offer, then goes to `/`.

**Files:** `apps/web/app/components/game/GameResult.vue`, `apps/web/app/components/game/GameScreen.vue`

## Definition of Done

- [ ] Component tests pass for:
  - the text of each end reason;
  - aborted shows only New game;
  - each rematch state;
  - New game emits `game:close_rematch` before navigating;
  - `game.player_has_active_game` shows its message.
- [ ] lint + typecheck clean

## Notes

- Runs after T21 in the `GameScreen.vue` lane.
