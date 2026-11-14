---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0007 — Let the game context own the rematch and a player's presence in their game

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

The glossary defines a rematch as «a new game between the same two players, started right after their previous game ended», while pairing two players is the match context's job (`docs/bc-map.md`). So it is a fair question which context owns the rematch offer, its acceptance and the creation of the new game. The same applies to presence: «offline» means having no connection to *their game*. US-06 (AC-22 … AC-26) demands at most one new game, an offer that survives going offline, acceptance only while both players are online, and the boosts KPI counts rematches per pair. Moving this between contexts later means new events and rewritten tests.

## Decision drivers

- AC-22b, AC-23: at most one new game, even with concurrent presses; CONTEXT invariant «a player has at most one active game at a time».
- AC-24, AC-24b, AC-25, AC-25b: offer lifetime tied to the finished game and to both players' presence.
- The match context is not built; game-play must deliver US-06 on its own (PRD §3: «how players meet» is a separate feature).
- game-play ADR-0003: one queue per game already serializes a game's actions.

## Considered options

1. **game owns rematch and presence** — the offer is state of the finished game, handled in that game's queue; acceptance creates the new game through the same use case as `MatchCreated` and publishes `GameStarted` with a link to the previous game; presence is tracked per game connection.
2. **match owns the rematch** — game forwards a `RematchRequested` event; match collects both agreements, pairs with swapped colours and publishes `MatchCreated`, from which game creates the game.

## Decision outcome

**Chosen:** Option 1. A rematch reuses an existing pair — no matching criteria apply — and keeping it in game puts every «exactly once» rule into one queue instead of spreading it across two contexts over asynchronous events. game-play does not depend on the unbuilt match context.

Details fixed by this decision:

- **(a) «One active game per player» is guaranteed by a database uniqueness constraint** that both creation paths (from `MatchCreated` and from an accepted rematch) go through; a violation becomes AC-22b's «you already have an active game» (and `GameNotStarted` for a pairing — game-play ADR-0006). In the same transaction that creates a game, game cancels any open rematch offers of those players (AC-25b).
- `GameStarted` for a rematch carries the previous game's id, so «rematch rate per pair» (PRD §7) can be computed.
- Presence = «at least one of the player's connections has this game open» (AC-31); it is in-memory, not persisted.

## Consequences

**Positive**
- US-06 ships without the match context; concurrency rules live in one place.
- Rematch metrics come straight from game data.

**Negative**
- Two paths create games; both must use the same use case and the same uniqueness rule.
- Presence is lost on restart and rebuilt as clients reconnect (players briefly look offline after a restart).

**Neutral**
- `docs/bc-map.md` records that game owns the rematch and in-game presence, with a link to this ADR.

## Links

- PRD: [[../PRD.md]] US-06, US-08, AC-22 … AC-26, AC-31; §7 «Rematch rate per pair»
- SAD: [[../sad.md]] §5
- Map: `docs/bc-map.md`
- Related ADR: [[0003-persist-each-action-before-broadcast-with-per-game-queue]], [[0006-in-process-event-bus-published-after-commit]]
