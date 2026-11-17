---
id: T4
title: "Add the ChessRules port and its chess.js adapter"
layer: "infra"
deps: ["T1"]
acs: ["AC-02", "AC-03", "AC-18"]
files_hint: ["apps/server/src/game/domain/ports/chess-rules.ts", "apps/server/src/game/infrastructure/chess-js-rules.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T4 — Add the ChessRules port and its chess.js adapter

## Why

Move legality comes from chess.js behind a port ([ADR-0005](../adr/0005-chess-js-behind-chess-rules-port.md)). Covers [PRD AC-02, AC-03, AC-18](../PRD.md).

**ACs:** AC-02, AC-03, AC-18 ([PRD §5](../PRD.md)) · **Blocked by:** T1 · **Estimate:** M

## What

- Port `ChessRules` (abstract class in `domain/ports`): apply a UCI half-move to a FEN. Returns legal / illegal and, for a legal move: the new FEN, check, checkmate, stalemate, the half-move clock and the repetition key.
- `ChessJsRules` in `infrastructure`, with chess.js pinned to an exact version.
- Repetition key = FEN fields 1–4. The en passant square counts only when that capture is a fully legal move (AC-18).

**Files:** `apps/server/src/game/domain/ports/chess-rules.ts`, `apps/server/src/game/infrastructure/chess-js-rules.ts`

## Definition of Done

- [ ] Adapter tests pass for:
  - a move that leaves its own king in check is illegal;
  - promotions `e7e8q|r|b|n` are legal, and `e7e8` without a piece is illegal;
  - mate and stalemate are detected;
  - the repetition key drops the en passant square when that capture is pinned;
  - the half-move clock reaches 100 for the 50-move rule.
- [ ] `make arch` is green.
- [ ] lint + typecheck clean

## Notes

- chess.js is never imported from `domain` (`.claude/rules/game.md`).
- Insufficient material is **not** taken from chess.js. The domain owns the narrower AC-18 list (T5).
