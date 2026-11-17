---
status: Draft
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-17"
feature_size: "M"
---

# Test plan — game-play

Two paired players play legal chess under a running clock; every game reaches exactly one correct game end or is aborted, both screens show the same result, a dropped player returns to the same game, and the pair can go straight into a rematch ([PRD](./PRD.md) §2).

Inputs: [PRD §5–§6](./PRD.md), [sad.md §6 / §10](./sad.md) (`target_surfaces: [backend-service, web-frontend]`), [data-model.md](./data-model.md), [contracts/events.md](./contracts/events.md), [tasks.json](./tasks/tasks.json) (the task ids in the last column are where `implement-tasks` writes each test).

## Levels

| Level | Scope in game-play | Strategy (generic — no tool names) |
|---|---|---|
| Unit | Domain (`Game`, `Clock`, `TimeControl`, material rules), the chess-rules adapter, application use cases, `TimerService`, `PresenceRegistry`, the client composable's state logic. | In-memory. Time and scheduling come through the `TimeSource` / `GameScheduler` ports, replaced by controllable fakes. No database, no network. |
| Integration | The repository, the per-game command pipeline, timers on boot, the gateway and the `CurrentPerson` adapter, each against what it owns. | A throwaway PostgreSQL 17 per suite with the real migrations applied; the gateway is exercised by two or more real socket clients against the real server module. Only the time ports may be replaced (to reach a deadline without waiting); the datastore is never mocked. Race tests (AC-10, AC-16, AC-20, AC-22, AC-23, AC-29) start the competing actions deterministically through a shared barrier: every client waits for one signal, then all send at once. Repeating the race several times in one run is only an extra safety net, not the mechanism. |
| Contract | The real-time messages and the integration events in `events.md`. | Validate the real payloads the server emits and accepts against the shapes in `events.md` (shared contracts package); an unknown field or a client-sent time/result field is refused. No hand-rolled stubs. |
| E2E | <!-- N/A: the only entry point is the UI; full flows are covered at E2E-through-UI. --> | — |
| Load | NFR «Capacity ≥ 20 concurrent games while all rows above still hold». | The load tool already in the repo, or a load-testing tool appropriate for the stack, driving bot clients over the real-time channel. |
| Component | Board, promotion picker, game actions, result screen, presence/clock display, `snapshotToView`. | Render in a component harness with a fake real-time connection; assert rendered output and emitted actions, no full app boot. |
| Visual-regression | <!-- N/A: UI not stable yet and no AC in §5 is about appearance; the look is checked by /sdlc:verify-ui. --> | — |
| E2E-through-UI | 7 scenarios (see below) — the flows that cross the browser, the server, the timers and the database. | Two isolated browser sessions against the real server and a fresh PostgreSQL, identity through the dev-only `CurrentPerson` adapter. Real time — the fixed time controls are not shortened (3+2 timeout ≈ 3 min, Blitz abort ≈ 20 s). |

## AC coverage

Levels: **U** unit · **I** integration · **Ct** contract · **Cmp** component · **UI-e2e** e2e-through-UI.

### US-01 — Play legal half-moves live

| AC | Test name (intent-based) | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-01 | legal half-move switches the turn | U | piece on the new square, Black to move | T5 |
| AC-01 | accepted half-move reaches both players | I | both sockets receive the same new snapshot | T9, T14 |
| AC-01 | move sound plays once per new half-move | Cmp | one sound per opponent/own half-move, none on re-render | T20 |
| AC-01 | full game to mate through two browsers | UI-e2e | see AC-17 scenario | T23 |
| AC-02 | illegal or out-of-turn half-move changes nothing | U | position, turn, clocks and increment unchanged; abort countdown keeps running before the side's first half-move | T4, T5 |
| AC-02 | rejected half-move is refused for both players | I | mover told it was not accepted; the opponent receives nothing; stored game unchanged | T9, T14 |
| AC-02 | rejected half-move rolls the piece back | Cmp | piece returns to its square | T20 |
| AC-03 | promotion to each of queen, rook, bishop, knight | U | chosen piece on the last rank, opponent to move | T4, T5 |
| AC-03 | closing the promotion choice sends nothing | Cmp | pawn back on its square, no action emitted, mover's clock still running | T20 |
| AC-04 | non-player and non-existent game get the same answer | U | identical «not found or not available» result from the use cases | T9 |
| AC-04 | non-player cannot open or act in a game | I | no board sent; half-move, resign and draw offer refused; reply identical to a non-existent game | T14 |
| AC-05 | connection without an identity is refused | I | a handshake without an identity is rejected; a dev identity opens the game only for its two players | T13, T14 |
| AC-05 | badly signed, foreign-audience and expired tokens are refused | I | each rejected at the handshake; a valid token opens the game only for its two players — **deferred** with the Cloudflare Access adapter | [T13-CF](./tasks/deferred/cf-access-adapter.md) |

### US-02 — Play under a running clock

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-06 | game created from a pairing has fixed control and colours | U | both clocks at base time; control and colours cannot change | T5 |
| AC-06 | pairing creates exactly one game and announces it | I | one stored game per pairing (repeat pairing ignored), game-started announced after commit | T11, T17 |
| AC-06 | pairing and game-started payloads match the contract | Ct | shapes equal `events.md` | T2, T11 |
| AC-06 | board is shown from the player's own colour with the opponent's nickname | Cmp | orientation per colour, nickname shown | T19 |
| AC-07 | increment is added after every half-move incl. the first | U | 3+2: 3:02 after the first half-move; mover's clock stops, the other starts | T3 |
| AC-07 | only the active side's clock counts down on screen | Cmp | the side to move counts down from the snapshot's remaining time | T18 |
| AC-08 | clock running out with both players offline ends the game once | U | one Timeout per deadline, White wins, no second end | T5, T10 |
| AC-08 | timeout while both players are offline | UI-e2e | game ends ≤ 1 s after the deadline (stored end time vs deadline); both see the same result on reopening | T23 |
| AC-09 | timeout against a side that cannot be mated is a draw | U | lone king or same-colour bishops → Draw; K+N vs K+Q → Black wins on time | T5, T10 |
| AC-09 | result screen explains a timeout draw | Cmp | text: time ran out but the opponent could not checkmate | T22 |
| AC-10 | half-move vs deadline decided by the game's own time | U | received before the deadline → counts; after → Timeout | T3, T9 |
| AC-10 | half-move and deadline racing through the game's queue | I | exactly one outcome stored; both clients receive the same one (time ports controlled, real queue and database) | T9, T10 |

### US-03 — Resign after confirming

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-11 | confirmed resignation ends the game | U | end reason Resign, opponent wins | T6 |
| AC-11 | resignation reaches both players | I | both receive the result with reason Resign | T15 |
| AC-11 | resign asks for confirmation before sending | Cmp | action sent only after confirming | T21 |
| AC-12 | cancelling the resign confirmation sends nothing | Cmp | nothing emitted, game continues, clock kept running | T21 |

### US-04 — Offer and answer a draw

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-13 | accepted draw offer ends the game | U, I | Draw by agreement, both see it | T6, T15 |
| AC-13 | accepting a draw shows the result | Cmp | result screen with Draw by agreement | T21 |
| AC-14 | declined or answered-by-move offer disappears | U, I | offer gone, offerer told it was declined | T6, T15 |
| AC-14 | offerer sees the decline | Cmp | declined state shown | T21 |
| AC-14b | offer on either turn waits and cannot be withdrawn | U, I | offer waits; no withdraw action accepted | T6, T15 |
| AC-14b | waiting offer shows no withdraw control | Cmp | no withdraw button | T21 |
| AC-15 | re-offer before own next half-move is refused | U, I | offer not sent; player told they can offer again after their next half-move | T6, T15 |
| AC-15 | blocked re-offer message | Cmp | message shown, offer button disabled until own half-move | T21 |
| AC-16 | simultaneous draw offers end the game once | U, I | one Draw by agreement, one game end | T6, T15 |

### US-05 — See how the game ended

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-17 | checkmating half-move ends the game | U | end reason Mate, mover wins | T5 |
| AC-17 | result screen names winner and reason | Cmp | winner, Mate, Rematch and New game shown | T22 |
| AC-17 | full game to mate through two browsers | UI-e2e | both browsers show the same Mate result | T23 |
| AC-18 | stalemate, insufficient material, threefold repetition, 50-move rule end the game | U | Draw with the right reason; repetition counts en passant only when fully legal | T4, T5 |
| AC-18 | game-end precedence on one half-move | U | Mate > stalemate > insufficient material > repetition > 50-move rule | T5 |
| AC-18 | each draw reason has its own text | Cmp | four distinct reason texts | T22 |
| AC-19 | bishop colours decide insufficient material | U | same colour → Draw «neither side can checkmate»; opposite → game continues | T5 |
| AC-19 | reason text for same-colour bishops | Cmp | «neither side can checkmate» shown | T22 |
| AC-20 | actions after the game end are refused | U | half-move, resign, draw offer and accept refused; waiting offer cleared; end unchanged | T5, T6 |
| AC-20 | late actions over the real channel are refused | I | refused for both players; stored end and reason unchanged | T15 |
| AC-21 | stored game end is the single source of truth | I | reopening returns the same result; game-ended published at most once | T8, T11 |
| AC-21 | game-ended payload matches the contract | Ct | shape equals `events.md` | T2, T11 |
| AC-21 | result screen rendered from a reopened snapshot | Cmp | same result and reason as at the end | T22 |

### US-06 — Rematch or start a new game

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-22 | accepted rematch starts one swapped-colour game | I | exactly one new game, same control, colours swapped, both clients sent to it | T16 |
| AC-22 | rematch states on the result screen | Cmp | offered / waiting / accepted states | T22 |
| AC-22 | rematch accepted opens one new game with swapped colours | UI-e2e | both browsers land on the same new board with swapped colours | T23 |
| AC-22b | player with an active game gets no new game | I | database refuses a second active game; rematch refused; pairing answered with game-not-started | T8, T11, T16 |
| AC-22b | active-game message | Cmp | «you already have an active game» shown | T22 |
| AC-23 | double press or both pressing gives at most one game | I | one offer / agreement; at most one new game | T16 |
| AC-24 | rematch offer survives going offline | U | presence change does not touch the offer | T12 |
| AC-24 | offer still shown after the offline player returns | I | offer kept; the online player is told the other is offline | T16 |
| AC-24 | offline marker beside a waiting rematch | Cmp | offline shown, offer still visible | T22 |
| AC-24b | accepting while the offerer is offline is refused | I | not accepted, no new game, offer kept | T16 |
| AC-24b | refused accept message | Cmp | told to wait until both are online | T22 |
| AC-25 | decline, cancel or explicit New game withdraws the offer | I | offer closed; the other player is told the rematch will not happen | T16 |
| AC-25 | withdrawn rematch state | Cmp | «rematch will not happen» shown | T22 |
| AC-25b | starting another game closes the waiting offer | I | offer closed inside the game-creation transaction; the other player notified | T8, T11, T16 |
| AC-26 | New game withdraws own offer before leaving | I | offer closed | T16 |
| AC-26 | New game closes the offer, then navigates | Cmp | close emitted before navigation to the New game screen | T22 |

### US-07 — Return to my game

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-27 | re-joining returns the full current snapshot | I | position, both remaining times, turn, waiting draw offer | T14 |
| AC-27 | composable re-joins after reconnect | Cmp | re-join sent once the connection is back | T18 |
| AC-27 | drop and reconnect mid-game | UI-e2e | reopened game shows the real position and clocks; play continues | T23 |
| AC-27b | composable never sends while disconnected and marks unanswered actions pending | U | no send while offline; pending on acknowledgement timeout; resolved by the next snapshot | T18 |
| AC-27b | repeated command id is applied once | I | same command id stored once; second attempt has no effect | T8, T9 |
| AC-27b | drop right after a half-move | UI-e2e | after reconnect the board shows whether the half-move happened; if not, it can be made again | T23 |
| AC-28 | offline side's clock keeps running | U | Timeout when it runs out, regardless of presence | T5, T10 |
| AC-28 | covered by the timeout-while-offline scenario | UI-e2e | see AC-08 | T23 |
| AC-29 | half-move from one tab reaches every tab, applied once | I | all sockets of the player get the snapshot; duplicate command id ignored | T8, T9, T14 |
| AC-29 | two tabs of one player | UI-e2e | second tab shows the same position; one half-move stored | T23 |
| AC-29b | overdue game ends exactly once after a simulated restart | U | one Timeout, downtime counted against the side to move | T10 |
| AC-29b | timers re-armed on boot from the database | I | active games re-armed; an overdue game ends once | T8, T17 |
| AC-29b | server restart mid-game | UI-e2e | game continues from the real position; a deadline passed during downtime gives one Timeout | T23 |

### US-08 — Know who I play and if they are here

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-30 | snapshot carries the opponent's nickname and optional rating | I | nickname always; rating only when present | T14 |
| AC-30 | player row without a rating | Cmp | nickname only, layout unchanged | T19 |
| AC-31 | online while at least one tab is open | U | multi-tab counting; one offline transition when the last tab closes | T12 |
| AC-31 | presence changes pushed to the opponent | I | offline then online pushed to the other player | T14 |
| AC-31 | offline marker beside the nickname | Cmp | marker toggles with presence | T19 |
| AC-31 | covered by the drop-and-reconnect scenario | UI-e2e | offline marker appears, then online after return | T23 |

### US-09 — Not wait for a game nobody started

| AC | Test name | Level | Expected outcome | Task |
|---|---|---|---|---|
| AC-32 | abort window per control, from creation | U | 20 s for 3+2 / 5+0, 60 s for 10+0; White's window starts at creation, Black's after White's first half-move | T3, T5, T10 |
| AC-32 | abort fired by the timer | I | game aborted, no result, no end reason; both clients told | T10, T11 |
| AC-32 | aborted state offers only New game | Cmp | «aborted», no Rematch | T22 |
| AC-32 | game nobody started is aborted after 20 s | UI-e2e | both browsers show «aborted» with only New game | T23 |
| AC-32b | only Cancel before both first half-moves; Cancel aborts | U | resign and draw offer refused in the window; Cancel aborts as in AC-32 | T6 |
| AC-32b | Cancel and refusals over the real channel | I | Cancel aborts; resign / draw offer refused | T15 |
| AC-32b | actions show Cancel only | Cmp | no Resign, no Offer draw | T21 |
| AC-33 | main clock does not run before the side's first half-move | U | main clock frozen, abort countdown running | T3, T5, T10 |
| AC-33 | abort countdown shown instead of the clock | Cmp | countdown visible to both | T19 |
| AC-34 | aborted game never counts as finished | I | no game-ended published; reopening shows «aborted» | T11 |
| AC-34 | aborted game publishes no game-ended | Ct | only `events.md` events allowed for an abort are emitted | T2, T11 |
| AC-34 | reopened aborted game | Cmp | «aborted», no result, no reason | T22 |

Coverage: **41 / 41 ACs** mapped; 0 uncovered.

### E2E-through-UI scenarios (7)

1. Full game to mate — AC-01, AC-17.
2. Timeout while both players are offline (lateness ≤ 1 s) — AC-08, AC-28.
3. Server restart mid-game — AC-29b.
4. Drop and reconnect mid-game (incl. drop right after a half-move) — AC-27, AC-27b, AC-31.
5. Two tabs of one player — AC-29.
6. Rematch accepted opens one new game with swapped colours — AC-22.
7. Game nobody started is aborted after 20 s — AC-32.

Scenarios 6 and 7 extend T23's list; T23 already allows plan-tests to pick the runner and scenarios.

## Edge cases / error paths

Dedicated error / authorization rows above: AC-02, AC-04, AC-05, AC-15, AC-20, AC-22b, AC-24b, AC-32b (refusals). Additional boundaries implied by the PRD and the SAD:

- Client message with an unknown field → refused, game unchanged (I + Ct, T14).
- Client message carrying remaining time or a game result (PRD §6.1 tampered screen) → refused; the game's own time decides (I + Ct, T14).
- Half-move received exactly at the deadline instant → Timeout (the deadline is not «before») (U, T3).
- Integration-event consumer throws → other consumers and the stored game unaffected (I, T11).
- Lost timer → the 5 s safety sweep ends the overdue game once and logs a warning (U, T10).
- Repeated pairing for the same match → no second game (I, T11).
- Dev-only identity adapter refuses to start outside development (U, T13).
- Storage failure while handling a pairing → **not tested: behaviour undecided** (sad.md §11 open question); add a row once that decision is made.
- Cloudflare Access token checks (signature, audience, expiry, unknown email) → **deferred** with the adapter to the deploy ([T13-CF](./tasks/deferred/cf-access-adapter.md)); locally identity comes from the dev adapter.

## Test data

- Seed strategy: factory functions in `apps/server/test/fixtures/` as listed in [data-model.md §Test fixtures](./data-model.md) — `newGame`, `newGameAfterFirstMoves`, `newEndedGame(reason, winner)`, `newAbortedGame`, `newRematchOffer(game, offeredBy)`; chess positions for rule tests as FEN constants next to the unit tests. PII guard: nicknames `Test White` / `Test Black`, ids as fresh UUID v7, no emails.
- Integration dependency: a throwaway PostgreSQL 17 container per suite, real migrations applied once at suite start, container removed at the end. No mocked datastore.
- Cleanup boundary: **per test** — truncate the five game-play tables (`games`, `player_active_games`, `half_moves`, `game_commands`, `rematch_offers`) before each test. Rollback-wrapping does not work here because the repository commits its own transaction per action (ADR-0003). Consequence: integration tests within one suite run serially.
- E2E-through-UI: a fresh database per run; every scenario creates its own player pair through the pairing CLI, so scenarios never share a game.
- Time: unit and integration replace only the time ports; e2e and load use real time.

## NFR validation (load)

One scenario covers the capacity NFR and re-checks every other numeric §6 row under that load. Tool: the load tool already in the repo, or a load-testing tool appropriate for the stack. Run against the NAS deployment (or an equivalent single-replica setup), not a developer laptop.

- **Scenario:** 20 concurrent 3+2 games (40 bot clients) for 10 minutes; every bot connection goes through a network-latency proxy adding 150 ms round-trip latency, no packet loss; bots move after 1–3 s; some games are left to run out on time and some bots drop and reconnect mid-game.
- **Thresholds (verbatim from PRD §6):**
  - half-move delivery ≤ 500 ms p95 (accept time on the server → shown on the opponent's client);
  - clock agreement ≤ 0.5 s difference once the half-move is shown on both boards;
  - timeout precision ≤ 1 s after a clock reaches zero;
  - offline shown ≤ 10 s after a disconnect, online ≤ 3 s after return;
  - current position and clocks shown ≤ 3 s after reopening;
  - plus: 0 games with two game ends and 0 result mismatches between the two clients (PRD §7).
- The 10-minute duration is a plan-tests choice; the PRD gives no duration.

## Manual scripted games (PRD §7)

Not automated, listed so the plan is complete: 10 scripted games covering pawn promotion, resignation, draw by agreement, stalemate, timeout and a mid-game disconnect; desktop browsers; the author plays through the 150 ms latency proxy (same LAN as the NAS), friends from their own home networks. **One of the 10 is played from a phone**: screen sleep → return to the game, and the move sound after the browser's autoplay restriction. This closes PRD §8 «separate networks and a phone».

## CI placement

There is no CI pipeline in the repo yet; this is advice for `implement-tasks` and future wiring.

- On every PR (`make test`): unit, component, contract **and** integration — integration guards the database invariants (one active game per player, command id once), so it runs every time; it needs Docker.
- Before merging a large PR and before every deploy to the NAS: e2e-through-UI (≈ 8 min with real time).
- Before circle 2 and after any change to the per-game queue, the timers or the real-time transport: the load scenario.

## Edits-log

```
{decision_id: "DEC-coverage-AC-10", action: "edit",
 before: "AC-10 → U (move vs deadline decided by game time)",
 after:  "AC-10 → U + I (race of half-move and deadline through the per-game queue on the real server: exactly one outcome, both clients receive the same)",
 user_reason: "додати I (integration) — гонка ходу і таймера дедлайну через per-game queue (ADR-0003/0004) на справжньому сервері: рівно один результат, обидва клієнти отримують однаковий."}
{decision_id: "DEC-strategy-prd-oq-phone", action: "edit",
 before: "Scripted games: one network, desktop browsers (PRD §8 default)",
 after:  "Desktop browsers + latency proxy for the author, friends on home networks, one of the 10 scripted games from a phone",
 user_reason: "Додати одну партію з телефона"}
```
