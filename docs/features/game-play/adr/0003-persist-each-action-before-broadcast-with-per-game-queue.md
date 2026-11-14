---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0003 — Persist each action before broadcast and process one game's actions through a single queue

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

Several criteria demand «exactly once» under concurrency: a half-move and a timeout at nearly the same moment (AC-10), two simultaneous draw offers (AC-16), two Rematch presses (AC-23), the same half-move from two tabs (AC-29). AC-29b requires a game to continue from its real position after a server restart, and threefold repetition (AC-18) needs the whole history of positions. We need to decide where the live game state lives and how concurrent actions are ordered. The choice shapes the tables and all server logic.

## Decision drivers

- QG-1 Single authoritative outcome (sad.md §1).
- QG-3 Recoverability — restart continues the game (AC-29b); a dropped half-move counts only if accepted (AC-27b).
- PRD §6 half-move delivery ≤ 500 ms p95 — a write before broadcast must fit the budget.
- Constraint (§2): one server process, PostgreSQL 17, no Redis.

## Considered options

1. **Game row + append-only half-move log, write before broadcast, one in-memory queue per game** — each accepted action is one transaction; actions of one game run strictly one after another; a `version` column is the database-level backstop (optimistic locking).
2. **Same schema, row lock instead of a queue** — every action does `SELECT … FOR UPDATE` on the game row; works across several processes, but every action reads from the database and timers still live in one process.
3. **State in memory, periodic snapshot** — fastest broadcast; a restart loses the latest half-moves, violating AC-29b and AC-27b.

## Decision outcome

**Chosen:** Option 1. It gives «exactly once» with the simplest mechanism for one process, survives restarts, and costs tens of milliseconds against a 500 ms budget. Option 2's multi-process advantage is theoretical while timers are per process (game-play ADR-0004).

Details fixed by this decision:

- **(a) Timeout and abort are commands in the same per-game queue.** The outcome is decided by comparing the game's own time with the deadline inside the transaction — not by the order in which the timer and the half-move arrive (AC-10, AC-32).
- **(b) Repetition is counted by a position key**, not by the raw FEN: piece placement, side to move, castling rights, and the en passant square only when an en passant capture is actually legal (pins and check considered) (AC-18).
- **(c) Column lists in sad.md are illustrations** (game: position, both remaining times, turn start, status, offers, `version`; half-move: number, move, position after). The final model is produced by `generate-data-model`.
- Every action carries a client `commandId`; a repeat with the same id returns the original outcome (idempotency for AC-27b, AC-29).

## Consequences

**Positive**
- A restart loses nothing that was acknowledged; the snapshot after reconnect is always the committed truth.
- «Exactly once» rules are ordinary sequential code inside one queue.

**Negative**
- Every action waits for a database commit before the opponent sees it.
- The per-game queue is correct only for one server process; several processes need option 2 or a distributed lock (sad.md §11).

**Neutral**
- The half-move log also gives boosts and a future replay feature the full history without a new table.

## Links

- PRD: [[../PRD.md]] AC-10, AC-16, AC-18, AC-23, AC-27b, AC-29, AC-29b, AC-32
- SAD: [[../sad.md]] §4
- Related ADR: [[0004-deadline-clock-with-per-game-timer-rearmed-on-boot]], [[0006-in-process-event-bus-published-after-commit]]
