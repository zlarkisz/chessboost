---
id: T16
title: "Wire the rematch end to end: offer, accept into a new game, close"
layer: "ports"
deps: ["T11", "T14"]
acs: ["AC-22", "AC-22b", "AC-23", "AC-24", "AC-24b", "AC-25", "AC-25b", "AC-26"]
files_hint: ["apps/server/src/game/application/rematch/", "apps/server/src/game/presentation/game.gateway.ts"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T16 — Wire the rematch end to end: offer, accept into a new game, close

## Why

The rematch belongs to game ([ADR-0007](../adr/0007-game-context-owns-rematch-and-presence.md)). Flows: `Rematch accepted` and `Rematch offer kept or withdrawn`. Unique index `uq_games_previous_game_id` ([data-model](../data-model.md)).

**ACs:** AC-22, AC-22b, AC-23, AC-24, AC-24b, AC-25, AC-25b, AC-26 ([PRD §5](../PRD.md)) · **Blocked by:** T11, T14 · **Estimate:** L

## What

- `OfferRematch`, `AcceptRematch`, `CloseRematch`, all through the ended game's queue.
- An offer is allowed only on an ended game, otherwise `game.rematch_not_allowed`. A repeat press is one offer.
- If the opponent's offer is waiting, pressing Rematch counts as agreement.
- Accept:
  - both players must be online, otherwise `game.opponent_offline` and the offer stays;
  - one transaction: new game with the same time control and swapped colours, `previous_game_id`, close the offer, active-game check (`game.player_has_active_game`);
  - after commit: `GameStarted` and arm the abort timer.
- The snapshot fills `rematchOfferedBy` / `rematchGameId`.
- Gateway handlers `game:offer_rematch`, `game:accept_rematch`, `game:close_rematch`.

**Files:** `apps/server/src/game/application/rematch/`, `apps/server/src/game/presentation/game.gateway.ts`

## Definition of Done

- [ ] Socket integration tests pass for:
  - both press → exactly one new game with swapped colours;
  - pressing twice → one offer;
  - accept while the offerer is offline → refused, and the offer stays;
  - close → both snapshots show no offer;
  - a player with another active game → `game.player_has_active_game`;
  - rematch on an aborted game → `game.rematch_not_allowed`.
- [ ] lint + typecheck clean

## Notes

- Runs after T15 in the `game.gateway.ts` lane.
