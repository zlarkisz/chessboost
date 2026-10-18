# game

Chess rules: game lifecycle, board, legal moves, clock, end of game.

- **Status:** scaffolded
- **Vocabulary:** Game, Board, Piece, Square, Move, Clock, EndReason
- **Publishes:** GameStarted, MoveMade, GameEnded
- **Listens to:** BoostSquareSpawned, BoostApplied (from boost); MatchCreated (from match)

Talks to other contexts only via `shared/events` — never imports them directly.
Layers: `domain/`, `application/`, `infrastructure/`, `presentation/` + `game.module.ts`.
See `docs/bc-map.md` for the full map.
