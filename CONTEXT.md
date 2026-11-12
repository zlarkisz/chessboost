---
status: Living
updated_at: "2026-11-09"
---

# Domain Context — chessboost

<!--
CONTEXT.md is the domain glossary — not a PRD and not a scratch pad. NO implementation
detail here (no datastore/broker/framework names, no API contracts) — only domain words
and the boundaries between them. Implementation choices live in the SAD and ADRs;
behaviour lives in PRD.md.

Multi-context repos: each bounded context has its own CONTEXT.md at its root path
(registered in CONTEXT-MAP.md). System-wide terms that span all contexts live in the
repo-root CONTEXT.md. Never duplicate a term across files — pick one owner.

Terms get fixed inline, the moment they surface in an interview / PRD / review — never
batched «I'll consolidate later». Empty H2 → prune before commit; keep only the sections
that carry real content. ## Glossary is mandatory; the other two are optional.
-->

## Glossary

<!-- One line per term: name · one-sentence canonical definition · one-sentence boundary
     (what it is NOT / the concept it gets confused with). Alphabetical once there are a few. -->
- aborted game — a game cancelled because one side did not make its own first half-move in time; it has no result and no end reason. NOT a game end (no Mate/Resign/Timeout/Draw is recorded) and NOT resignation (resigning gives the opponent the win).
- clock — the remaining time of each side in one game, started from its time control; only the side to move loses time. NOT the time control (the fixed rule it starts from; the clock is the live remaining time).
- draw offer — a proposal by one player to end the game as a Draw, which takes effect only if the opponent accepts it. NOT a draw by rule (stalemate, insufficient material, repetition, the 50-move rule), which needs no one's agreement.
- game — one chess game between two players on one board with one clock, from its first half-move until its game end or its abort. NOT a match (pairing two players is the match context's job) and NOT a series — a rematch is a new game.
- game end — the moment a game finishes, always with exactly one end reason: Mate, Resign, Timeout or Draw. NOT an aborted game (it has no result), and NOT check (the game goes on; only mate ends it).
- half-move — one move by one side (White or Black). NOT a full move (a White+Black pair, as in move numbering «1. e4 e5»).
- offline — a player's state of having no connection to their game. NOT resignation and NOT a game end.
- rematch — a new game between the same two players, started right after their previous game ended. NOT «New game» (that goes back to choosing settings and an opponent).
- rematch offer — one player's request for a rematch that waits for the opponent's acceptance. NOT a rematch itself (no new game exists until it is accepted).
- resignation — a player's own decision to end the game as a loss for themselves; it gives the end reason Resign. NOT an aborted game (resignation always gives a result) and NOT going offline (a disconnect by itself ends nothing).
- time control — the time rule a game is played under: base time per side plus an increment added after each of that side's half-moves (e.g. 3+2 = 3 minutes + 2 seconds). NOT the match context's pairing criterion (match only filters opponents by it; the game owns the rule) and NOT its display label like "3+2" on the New game screen (just how the rule is shown).

## Invariants

<!-- Domain rules that hold across the whole feature/codebase — phrased «X always must / can
     never». These are rules ABOVE any single acceptance criterion, not PRD AC. -->
- A disconnect can never stop the clock: the side to move keeps losing time while offline.
- A clock running out must always end the game exactly once, with the same result for both players, even when neither player is connected.
- When a side's clock runs out and the opponent cannot checkmate by any legal sequence of moves, the game must always end as a Draw, never as a win.
- A side that does not make its own first half-move in time must always abort the game; an aborted game can never get a game end.
- A rematch must always be accepted by both players, keep the same time control and swap colours.
