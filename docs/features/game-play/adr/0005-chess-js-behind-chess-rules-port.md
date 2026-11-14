---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0005 — Use chess.js behind a ChessRules port for move legality

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

game-play needs full chess legality: check, mate, stalemate, castling, en passant, promotion (AC-02, AC-03, AC-17, AC-18, AC-19). `apps/server/.dependency-cruiser.cjs` forbids `domain` from importing npm packages, and `.claude/rules/game.md` requires any chess library to sit behind a port; the rule pointed at a decision that did not exist yet. Boosts will later teleport pieces and grant extra moves, so the rules engine must cope with unusual positions.

## Decision drivers

- PRD §1: Approach A «Bare chess table» — any «wow» is scope creep; one developer.
- Architecture constraint (sad.md §2): pure `domain`, adapters in `infrastructure`.
- AC-18 / AC-09 define draw and timeout rules more precisely than generic libraries do.

## Considered options

1. **chess.js behind a `ChessRules` port** — legality from chess.js v1 (TypeScript, BSD-2-Clause) in `game/infrastructure`; game-specific rules stay in `game/domain`.
2. **Own move generator in `domain`** — full control and no dependency; weeks of work and classic pitfalls (en passant under a pin, castling through an attacked square) needing perft tests.
3. **chessops** — strong typed library; rejected because of its GPL-3.0 licence.

## Decision outcome

**Chosen:** Option 1. Days instead of weeks, a widely used move generator, and the port keeps the domain pure and the library replaceable.

Details fixed by this decision:

- **(b) The port speaks domain types** (square, piece, move, position) — never SAN strings or chess.js objects. The adapter translates.
- The domain owns: game-end precedence (Mate > stalemate > insufficient material > repetition > 50-move rule), insufficient material strictly per the AC-18 list, «can this side mate by material» for timeouts (AC-09), the repetition key (game-play ADR-0003 (b)), clocks and offers. chess.js's own `isDraw` / `isInsufficientMaterial` are not used to decide game ends.
- **(d) The adapter has contract tests on known positions** (promotion, en passant with a pin, castling rights, stalemate, the AC-19 bishop cases); the chess.js version is pinned exactly (no `^`).

## Consequences

**Positive**
- Legal-move generation is solved; effort goes into the game rules the PRD actually specifies.
- The library can be swapped behind the port without touching the domain.

**Negative**
- **(c) Boost positions may be unusual** (a teleported piece, an extra move for one side). chess.js validates FEN on load and may reject such positions; a no-validation mode or a different adapter may be needed. Tracked as a risk in sad.md §11 and to be checked in the boosts architecture.
- One more dependency to keep pinned and audited.

**Neutral**
- `.claude/rules/game.md` now points to this ADR instead of the unrelated `docs/adr/0002-shadcn-vue-for-web-ui.md`.

## Links

- PRD: [[../PRD.md]] AC-02, AC-03, AC-09, AC-17, AC-18, AC-19
- SAD: [[../sad.md]] §4, §11
- Boosts brief: [[../../boosts/idea-brief.md]]
- Related ADR: [[0003-persist-each-action-before-broadcast-with-per-game-queue]]
