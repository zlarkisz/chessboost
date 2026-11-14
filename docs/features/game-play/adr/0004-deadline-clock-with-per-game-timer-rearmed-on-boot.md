---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0004 — Keep a deadline clock with one timer per game, re-armed on boot

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

Clocks are the riskiest part of game-play (PRD §8: the clock spike runs first). A clock that runs out must end the game within 1 s even when both players are offline (AC-08, AC-28); time while the server is down counts against the side to move (AC-29b); before a side's own first half-move only the abort window runs (AC-32, AC-33). Both screens must show nearly the same remaining time. We need to decide how the server keeps time, how clients display it, and what wakes the server when time runs out.

## Decision drivers

- PRD §6: timeout precision — game ends ≤ 1 s after a clock reaches zero, also when both players are offline.
- PRD §6: clock agreement between the two screens ≤ 0.5 s difference.
- QG-1 / CONTEXT invariant: a clock running out must always end the game exactly once.
- Constraint (§2): one server process; game-play ADR-0003 per-game queue.

## Considered options

1. **Deadline + one timer per game, re-armed on boot** — server stores remaining times and the turn start; a per-game timer fires at the deadline; clients count down locally.
2. **Deadline + periodic sweeper** — one loop every 250 ms queries the database for overdue games; no timer state in memory.
3. **Server broadcasts clock ticks** — server sends the current time to both players every 100–1000 ms; clients compute nothing.

## Decision outcome

**Chosen:** Option 1. A timer per game is precise to tens of milliseconds, works with no client connected, and adds no traffic between half-moves.

Details fixed by this decision:

- The server stores both remaining times and the moment the current turn began; the deadline is derived. Before a side's first half-move the deadline is the abort window (20 s Blitz, 60 s Rapid — AC-32), and the main clock does not run (AC-33).
- A timer fires → a «check time» command goes into the game's queue (game-play ADR-0003 (a)); the transaction compares the game's own time with the deadline.
- On boot, all active games are loaded from the database and timers re-armed; games already past their deadline end at once (AC-29b).
- **(a) Clients receive remaining times, never an absolute deadline.** A client counts down with a monotonic timer from the moment the message arrived, because the device's wall clock may be off.
- **(b) Safety sweep every 5 s** queries active games whose deadline is in the past and enqueues a time check for each. It is a backstop for a lost timer, not the primary mechanism; every hit is logged as WARN (sad.md §7).

## Consequences

**Positive**
- Timeout precision is bounded by timer accuracy, well inside 1 s, with no client involved.
- No traffic while nobody moves; the opponent's offline state does not matter.
- A restart or a lost timer cannot leave a game running forever.

**Negative**
- A client's countdown can drift from the server's between half-moves; agreement is checked with the PRD §6 logs.
- Timers live in one process — another process would need a shared scheduler.
- **The model is validated by the clock spike (PRD §8). If the spike fails PRD §6 «≤ 0.5 s difference», this ADR is revisited.**

**Neutral**
- Network delay counts against the mover's clock (PRD §3 non-goal: no lag compensation).

## Links

- PRD: [[../PRD.md]] §6, §8, AC-07, AC-08, AC-10, AC-28, AC-29b, AC-32, AC-33
- SAD: [[../sad.md]] §4, §7
- Related ADR: [[0003-persist-each-action-before-broadcast-with-per-game-queue]]
