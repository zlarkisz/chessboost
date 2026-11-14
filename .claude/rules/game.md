---
paths: ["apps/server/src/game/**"]
---

# game context

Owns chess rules: game lifecycle, board, legal moves, clock, end of game.

## Boundaries

- The single source of truth for the board. Publishes `MoveMade` after every legal
  move with enough state for `boost` to find free squares (position + half-move number).
- Reacts to `BoostSquareSpawned` (relay to both clients via `GameGateway`) and to
  `BoostApplied` (apply the effect, then re-validate: check, mate, illegal positions).
- Knows boost *effects* only as data from events — never boost spawning rules.

## Prohibitions

- No imports from `src/boost/**` or any other context — only `shared/events`.
- No chess-engine library imported directly in `domain/` — chess.js sits behind the
  `ChessRules` port with the implementation in `infrastructure/` (see
  `docs/features/game-play/adr/0005-chess-js-behind-chess-rules-port.md`).
- WebSocket message shapes live in `presentation/` DTOs, not in `domain/`.
