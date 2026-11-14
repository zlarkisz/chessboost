---
status: Approved
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: "M"
stage: "03"
ticket: ""
---

# PRD — game-play

> **Inputs (required):** [idea-brief](./idea-brief.md) · [CONTEXT](./CONTEXT.md) (symlink to the repo-root glossary)
> **Reference module:** N/A — green-field mode (the server `game` context is empty).
> **External context channels used:** Project docs: `docs/adr/0001-initial-setup.md`, `docs/bc-map.md`, `docs/features/boosts/idea-brief.md` (+ its CONTEXT), `docs/design/design-spec.md` (New game screen), `SPEC.md`, `apps/server/src/game/README.md`, `apps/server/src/match/README.md`.

## 1. Context

Today two people cannot play a single game of chess in chessboost: the demo game is a static screen, and the New game screen only simulates creating a game. Because of that, boosts (brief confirmed 2026-11-08) have nothing to run on and cannot be built or tested online. The first users are the author and 1–2 friends (3 people) who will play 10 scripted games; the wider circle of 10–20 friends receives game-play only together with boosts, after the scripted-game gate is met.

Why now: game-play is the one thing blocking boosts, the feature that makes the product different; any «wow» inside game-play is treated as scope creep. It is also the first time the project keeps two players in sync in real time, which is the main new skill and the main risk.

Committed approach (idea-brief §13, Approach A «Bare chess table»): only what is needed for every game to reach a correct end — legal chess including pawn promotion; clocks per time control; resignation with confirmation; draw offer; all five draws (agreement, stalemate, insufficient material, repetition, 50-move rule); a Timeout against a side that cannot be mated by its opponent is a Draw; a result screen with the reason; Rematch and New game; the opponent's nickname; a move sound; returning to the same game with the clock still running; an offline marker; and abort when a side does not make its first half-move in time.

Traceability:
- Baseline idea (write-prd interview, verbatim): «Двоє зареєстрованих гравців грають повноцінну онлайн-партію з годинниками: бачать нік суперника і чи він онлайн, можуть запропонувати нічию або здатися з підтвердженням; можна повернутися в ту саму партію після розриву (годинник іде далі), а партія скасовується (abort), якщо сторона не зробила свій перший напівхід вчасно. Партія закінчується матом, нічиєю, здачею чи часом і показує результат із причиною та кнопки «Реванш» / «Нова гра». Без бустів, рейтингу, реєстрації як такої, списку ходів і підказок — це фундамент для бустів.»
- Interview decisions closing idea-brief §15: repetition and the 50-move rule end the game automatically (threefold repetition, 50 full moves); a draw offer is declined by the opponent's half-move and can be repeated only after the offerer's own next half-move; a rematch offer is withdrawn only by an explicit action, never by going offline.
- Context boundaries (`docs/bc-map.md`, ADR 0001): a game is created from a pairing made by the match context; every half-move must be published with enough state for the boost context to count half-moves and find free squares; the game end is published once for the player context (rating).
- Boosts brief §13: rematches are counted per pair (see KPI «Rematch rate per pair»). In game-play the sides always alternate; how a boost could grant an extra move is a question for architecture-design.
- New game design spec §11: the offered time controls are 3+2 and 5+0 (Blitz) and 10+0 (Rapid); there is no Bullet control today, so only the 20 s and 60 s abort windows apply.

## 2. Goals

- Every game between two players either reaches exactly one correct game end or is aborted — never both, never neither — and both players see the same result and reason, even when one or both of them are offline.
- A player who loses connection can return to the same game and continue from the real current position, without the disconnect pausing or ending anything by itself.
- After a game ends, the same two players can go straight into a rematch (or back to New game) — the habit observed with friends, and the measurement the boosts feature relies on.

## 3. Non-goals

- Boosts — a separate feature (`docs/features/boosts/`); game-play is its foundation and contains no boost behaviour.
- Registration and «how players meet» (invite link, creating a game, wiring the New game screen to a real game) — separate prerequisite features; game-play starts once two registered players have been paired.
- Rating — a separate brief; game-play shows the opponent's rating when one exists and works fully without it.
- Move list, legal-move hints, a claim-draw button, a separate disconnect timer or loss for abandoning a game, rematch after an aborted game (it has no game end, so only New game is offered), chat, spectators, replays and matchmaking — outside Approach A (parked approaches C and B; matchmaking is a SPEC non-goal); against a player who walks away, the only protection is that player's own clock.
- Detecting dead positions beyond material (for example, locked pawn chains): draws by insufficient material and timeout draws are judged only by the material on the board (AC-09, AC-18); such positions play on until repetition or the 50-move rule.
- A banner or automatic redirect to an unfinished game from other pages — a player returns through the link to the same game (AC-27); entry points belong to the «how players meet» and New game features.
- Lag compensation — network delay counts against the mover's clock; revisit if scripted games show losses on time with a fraction of a second left on the player's screen.

## 4. User stories

### US-01: Play legal half-moves live
**As a** player
**I want** to make legal half-moves on a board shared with my opponent, including pawn promotion, and see and hear my opponent's half-moves as they happen
**So that** we play a real game of chess online instead of a demo

### US-02: Play under a running clock
**As a** player
**I want** each side's clock to run according to the game's time control, with the increment added after every half-move
**So that** the game has time pressure and a side that runs out of time loses (or draws when the opponent cannot mate)

### US-03: Resign after confirming
**As a** player
**I want** to resign only after confirming it
**So that** I can end a lost game myself without losing a game by an accidental click

### US-04: Offer and answer a draw
**As a** player
**I want** to offer a draw and accept or decline my opponent's draw offer
**So that** we can end a game as a Draw by agreement

### US-05: See how the game ended
**As a** player
**I want** the game to end by itself on mate, stalemate, insufficient material, repetition, the 50-move rule or timeout, and to see the result with its reason
**So that** I always know who won, or why it is a draw, without arguing with my opponent

### US-06: Rematch or start a new game
**As a** player
**I want** to offer or accept a rematch, or go to New game, from the result screen
**So that** we keep playing without setting everything up again

### US-07: Return to my game
**As a** player
**I want** to come back to the same game after losing connection, with the real position and clocks
**So that** a dropped connection by itself does not cost me the game

### US-08: Know who I play and if they are here
**As a** player
**I want** to see my opponent's nickname (and rating, if they have one) and whether they are online or offline
**So that** I know who I am playing and whether to wait for them

### US-09: Not wait for a game nobody started
**As a** player
**I want** a game to be aborted when either side does not make its own first half-move in time
**So that** I am not stuck waiting for an opponent who never began playing

## 5. Acceptance criteria

### AC-01 (US-01) — happy
**Given** a game between two players in which it is White's turn
**When** the White player makes a legal half-move
**Then** both players see the piece on its new square and hear the move sound, and it becomes Black's turn

### AC-02 (US-01) — error
**Given** a game in progress
**When** a player tries to make an illegal half-move (for example, one that leaves their own king in check) or tries to move when it is not their turn
**Then** the half-move is not accepted, the piece returns to its square, the position and the turn stay the same for both players, no increment is added and the clocks do not switch — the side to move's clock keeps running (before that side's own first half-move, its abort countdown keeps running instead)

### AC-03 (US-01) — happy
**Given** a player's pawn makes a legal half-move to the last rank
**When** the player chooses the piece it promotes to (queen, rook, bishop or knight)
**Then** both players see the chosen piece on that square, and it becomes the opponent's turn; the half-move counts only once the piece is chosen — until then the opponent sees nothing and the mover's clock keeps running, and if the player closes the choice the pawn returns to its square and no half-move is made

### AC-04 (US-01) — authorization
**Given** a signed-in person who is not one of the two players of a game
**When** they open that game or try to make a half-move, resign or offer a draw in it
**Then** the system does not show them the board, does not accept any of these actions, and tells them the game was not found or is not available to them — the same message they see for a game that does not exist, so a link never reveals whether a game exists

### AC-05 (US-01) — cross-context
**Given** a person who is not signed in (registration is a separate feature)
**When** they open a link to a game
**Then** the system asks them to sign in first and, after they sign in, opens the game only if they are one of its two players

### AC-06 (US-01) — cross-context
**Given** two players have just been paired for a game with a time control and colours (pairing belongs to the match context)
**When** the game opens for them
**Then** each player sees the board from their own colour, both clocks set to that time control's base time, and the opponent's nickname; the time control and colours cannot be changed inside the game

### AC-07 (US-02) — happy
**Given** a game with time control 3+2 in which both sides have made their first half-move and it is White's turn
**When** White makes a half-move
**Then** White's clock stops, 2 seconds are added to White's remaining time, Black's clock starts, and both players see the same remaining times; the increment is added after every half-move of a side, including its first one (as in FIDE: with 3+2, 3:02 after the first half-move)

### AC-08 (US-02) — domain invariant
**Given** it is Black's turn, White can still checkmate, and Black is offline (or both players are offline)
**When** Black's clock runs out
**Then** the game ends exactly once with end reason Timeout and White as the winner, and both players see this same result whenever they next open the game

### AC-09 (US-02) — domain invariant
**Given** it is White's turn and, judged only by the material of both sides, Black cannot checkmate — Black has a lone king, or the material of both sides cannot produce mate (for example, king and bishop against king and bishop with all bishops on squares of the same colour)
**When** White's clock runs out
**Then** the game ends as a Draw, never as a win for Black, and the result screen says the time ran out but the opponent could not checkmate; when mate is possible with the material on the board (for example, king and knight against king and queen), Black wins by Timeout

### AC-10 (US-02) — domain invariant
**Given** White has almost no time left
**When** White's half-move and White's clock running out happen at nearly the same moment
**Then** the system decides once, by the game's own time: the half-move counts only if the game received it before White's time ran out, otherwise the game ends by Timeout, and both players see the same outcome

### AC-11 (US-03) — happy
**Given** a game in progress
**When** a player chooses to resign and confirms it
**Then** the game ends with end reason Resign, the opponent wins, and both players see the result screen with this reason

### AC-12 (US-03) — happy (alternative)
**Given** a player has chosen to resign and sees the confirmation
**When** they cancel it
**Then** the game continues unchanged, and the side to move's clock kept running while the confirmation was open

### AC-13 (US-04) — happy
**Given** a player has offered a draw
**When** the opponent accepts it
**Then** the game ends with end reason Draw (by agreement) and both players see the result screen with this reason

### AC-14 (US-04) — domain invariant
**Given** a player's draw offer is waiting
**When** the opponent declines it or makes their half-move instead of answering
**Then** the offer disappears and the offering player sees that it was declined

### AC-14b (US-04) — domain invariant
**Given** both sides have made their first half-move and the player is allowed to offer a draw (AC-15)
**When** the player offers a draw, on their own turn or on the opponent's turn
**Then** the offer is sent and waits for the opponent's answer; the offering player cannot withdraw it — it disappears only when the opponent accepts it, declines it or makes their half-move (AC-14), or when the game ends

### AC-15 (US-04) — domain invariant
**Given** a player's draw offer was declined
**When** that player tries to offer a draw again before making their own next half-move
**Then** the system does not send the offer and tells the player they can offer a draw again after their next half-move

### AC-16 (US-04) — domain invariant (concurrent)
**Given** no draw offer is waiting
**When** both players offer a draw at nearly the same moment
**Then** the game ends as a Draw by agreement exactly once

### AC-17 (US-05) — happy
**Given** a game in progress
**When** a player makes a half-move that checkmates
**Then** the game ends with end reason Mate, and both players see a result screen naming the winner and the reason, with Rematch and New game

### AC-18 (US-05) — domain invariant
**Given** a game in progress
**When** a half-move produces stalemate, insufficient material (only these: king against king; king and bishop against king; king and knight against king; kings and bishops only, with all bishops on squares of the same colour), the same position for the third time (same side to move, same castling and en passant rights — an en passant right counts only when that capture is a fully legal move, taking pins and check into account), or 50 full moves in a row without a capture or a pawn move
**Then** the game ends as a Draw at once, without anyone claiming it, and the result screen names which of these four reasons applied; when one half-move triggers several game ends, only the first in this order applies and is shown: Mate > stalemate > insufficient material > repetition > 50-move rule

### AC-19 (US-05) — domain invariant
**Given** only the two kings and one bishop for each side remain
**When** the bishops stand on squares of the same colour
**Then** the game ends as a Draw at once with the reason «neither side can checkmate»; and when the bishops stand on squares of opposite colours, the game continues, because checkmate is still possible by a legal sequence of moves

### AC-20 (US-05) — domain invariant
**Given** a game has reached its game end
**When** either player tries to make a half-move, resign, offer a draw or accept a draw offer that was waiting
**Then** the system does not accept it, any waiting draw offer disappears, and the game end and its reason stay unchanged

### AC-21 (US-05) — cross-context
**Given** a game reaches its game end by any reason
**When** either player opens that game later
**Then** they see the same single result and end reason, and the game counts once in the players' results that the rating feature will use when it exists

### AC-22 (US-06) — happy
**Given** a game has ended and one player has offered a rematch
**When** the opponent accepts it
**Then** exactly one new game starts between the same two players, with the same time control and swapped colours, and both players are taken to its board

### AC-23 (US-06) — domain invariant (concurrent)
**Given** a game has ended and no rematch offer is waiting
**When** both players press Rematch at nearly the same moment, or one player presses it twice
**Then** the two presses count as agreement (or as one offer), and at most one new game starts

### AC-24 (US-06) — domain invariant
**Given** a rematch offer is waiting
**When** either player goes offline
**Then** the offer stays, the player who is still online sees that the other player is offline, and the offer is still shown when the offline player comes back to the result screen

### AC-24b (US-06) — domain invariant
**Given** a rematch offer is waiting and the offering player is offline
**When** the opponent tries to accept it
**Then** the system does not accept it and no new game starts; the opponent can accept once both players are online again, and the offer itself stays (AC-24)

### AC-25 (US-06) — happy (alternative)
**Given** a rematch offer is waiting
**When** the opponent declines it or chooses New game, or the offering player cancels it or moves away from the result screen by an explicit action (for example, opens New game)
**Then** the offer disappears and the other player sees that the rematch will not happen; going offline — by either player — never withdraws the offer (see AC-24)

### AC-26 (US-06) — cross-context
**Given** a game has ended
**When** a player chooses New game
**Then** they are taken to the New game screen (owned by the separate New game feature), and any rematch offer they made is withdrawn

### AC-27 (US-07) — happy
**Given** a player lost connection during their game
**When** they open the link to that same game again
**Then** they see the current position, both clocks with the real remaining time, whose turn it is and any draw offer waiting, and they can continue playing

### AC-27b (US-07) — domain invariant
**Given** a player has the game open and their connection drops right after they make a half-move
**When** the connection comes back
**Then** the half-move counts as made only if the game accepted it; the player sees the real current position — if the half-move did not happen, they have to make it again (if their time has not run out)

### AC-28 (US-07) — domain invariant
**Given** it is a player's turn, they have already made their own first half-move, and they go offline
**When** time passes
**Then** the opponent sees that player's clock keep running, and the game ends by Timeout if it runs out

### AC-29 (US-07) — domain invariant (concurrent)
**Given** a player has the same game open in two browser tabs or on two devices
**When** they make a half-move in one tab
**Then** the other tab shows the same position, and the half-move is made only once

### AC-30 (US-08) — cross-context
**Given** a game in progress
**When** a player looks at the opponent's side of the board
**Then** they see the opponent's nickname, and the opponent's rating next to it only if the opponent has one; without a rating the game works the same

### AC-31 (US-08) — happy
**Given** a game in progress
**When** the opponent loses connection, and later comes back
**Then** within the time set in §6 the player sees the offline marker next to the opponent's nickname, and the online marker again once the opponent returns; the opponent counts as online while at least one of their tabs or devices has the game open

### AC-32 (US-09) — domain invariant
**Given** a new game with a Blitz time control (3+2 or 5+0, window 20 seconds) or a Rapid one (10+0, window 60 seconds)
**When** White does not make its first half-move within the window, which starts the moment the game is created (from a pairing or an accepted rematch) whether or not anyone has opened the board yet, or Black does not make its own first half-move within the window after White's
**Then** the game is aborted: both players see that it was aborted, with no result and no end reason, and only New game is offered (no rematch, because an aborted game never ended)

### AC-32b (US-09) — happy (alternative)
**Given** a new game in which at least one side has not yet made its own first half-move
**When** either player looks at the game's actions
**Then** they see no Resign and no Offer draw, only Cancel; when either player chooses Cancel, the game is aborted exactly as in AC-32 — no result, no end reason, only New game offered

### AC-33 (US-09) — domain invariant
**Given** a new game in which a side has not yet made its own first half-move
**When** that side is to move
**Then** its main clock does not run yet; instead both players see the countdown until the game is aborted

### AC-34 (US-09) — cross-context
**Given** a game was aborted
**When** either player opens that game later
**Then** they see that it was aborted with no result and no end reason, and the game does not count in the players' results that the rating feature will use when it exists

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Half-move delivery to the opponent | ≤ 500 ms p95 on an ordinary home connection (= 150 ms round-trip latency, no packet loss) | time from the half-move being accepted to it appearing on the opponent's board, logged in scripted games |
| Clock agreement between the two screens | ≤ 0.5 s difference, measured once the half-move is shown on both boards | both clients log the remaining time they display at that moment for every half-move; logs compared after scripted games (no screen recordings) |
| Timeout precision | the game ends ≤ 1 s after a clock reaches zero, also when both players are offline | scripted timeout games: logged game-end time vs the moment the time ran out |
| Offline / online marker | offline shown ≤ 10 s after the opponent loses connection; online shown ≤ 3 s after they return | scripted game with a disconnect, client logs |
| Return to a game | current position and clocks shown ≤ 3 s after reopening the game on an ordinary home connection (150 ms round-trip latency, no packet loss) | scripted game with a disconnect: the client logs the time from opening the page to showing the position |
| Capacity | ≥ 20 concurrent games while all rows above still hold | smoke test with bots playing games concurrently, run before circle 2 (10–20 people ≈ 10 games, ×2 headroom) |

## 6.1 Security / privacy

- **Data classification:** internal — moves, results and nicknames are seen only by the two players of a game; nothing confidential or regulated.
- **Personal data touched:** no new personal fields are collected. Game-play reads the opponent's nickname and, when present, rating from other features; it records each game linked to its two players (half-moves, result, end reason, remaining times) and shows a player's online/offline state to their opponent.
- **AuthZ/AuthN impact:** only signed-in persons can open a game (registration is a prerequisite feature); only the two players of a game can see it or act in it; only the side to move can make a half-move; resigning, offering a draw and offering a rematch are limited to the game's players; time and game end are decided only by the game, never by a player's screen.
- **Abuse cases:**
  - A non-player opens someone else's game or tries to act in it → denied, the board is not shown, and they are told only its two players can open it (AC-04).
  - A player tries to move the opponent's pieces or to move out of turn → the half-move is not accepted (AC-02).
  - A tampered screen reports false remaining time or a false game end → ignored; the game's own time and rules decide (AC-08, AC-10).
  - Draw-offer spam → at most one draw offer per own half-move (AC-15); repeated Rematch presses count as one offer (AC-23).
  - Guessing game links → a link reveals nothing to someone who is not one of the game's players, not even whether the game exists: someone else's game and a non-existent one look the same (AC-04, AC-05).
- **Security review:** Required — a new authorization boundary (per-game player check) and the project's first real-time channel between players.

## 7. Metrics / KPIs

- **Scripted games reaching a correct game end without a page reload** — a reload means one done to recover from a stuck or wrong state; reopening the game in the disconnect scenario is part of that scenario, not a failure. Baseline: 0/10, target: ≥ 9/10 before boosts reach circle 2. The 10 scripted games cover pawn promotion, resignation, draw by agreement, stalemate, timeout and a mid-game disconnect.
- **Same result and end reason on both screens** — baseline: none (no live games), target: 0 mismatches across all scripted games (every scenario, not only timeout and disconnect), checked by comparing both clients' logs.
- **Rematch rate per pair** — primary: share of pairs (two players who finished at least one game together; aborted games excluded) that accepted at least one rematch; this is the baseline for the boosts KPI «rematch ≥ 40% of pairs». Secondary, because circle 1 has at most 3 pairs: share of finished games followed by an accepted rematch. Report both with the number of pairs and of finished games. Baseline: measured over the first 2 weeks of circle-1 play; target: none for game-play.
- **Half-move delivery p95** — baseline: none (no live games), target: ≤ 500 ms over all circle-1 games (same as §6).

## 8. Open questions

- [ ] Must a game in progress survive a server restart, and how is the time while the server was down counted? Losing a game on restart would break the invariant "a clock running out must always end the game exactly once". Interim for circle 1 only: deploys happen when no game is in progress. Must be decided before circle 2. — owner: Gleb Bufin, due: before /sdlc:architecture-design
- [ ] If the timeout scripted game is still red after the first week of implementation, do we cut Approach A's scope? Default now: keep the full scope; the clock spike runs first. — owner: Gleb Bufin, due: end of implementation week 1
- [ ] Do the scripted games need real separate networks and a phone (device sleep, move sound blocked by the browser)? Default now: one network, desktop browsers. — owner: Gleb Bufin, due: before /sdlc:plan-tests
- [ ] Does a waiting rematch offer ever expire (for example, after some hours or days)? Default now: it never expires; only the explicit actions in AC-25 and AC-26 withdraw it. — owner: Gleb Bufin, due: before /sdlc:architecture-design
- [ ] Can a player have more than one active game at a time (for example, accept a rematch while already playing another game)? Default now: not forbidden explicitly in game-play; the match context decides. — owner: Gleb Bufin, due: before /sdlc:architecture-design
