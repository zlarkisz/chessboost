---
status: Draft
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-16"
feature_size: M
contract_version: "0.1.0"
---

# Events — game-play

Interface contract for game-play. The feature has **no HTTP API**: the browser talks to the server only over Socket.IO (game-play [ADR-0002](../adr/0002-socket-io-for-realtime-channel.md), `ARCHITECTURE.md`), and contexts talk only through `shared/events` on an in-process bus (game-play [ADR-0006](../adr/0006-in-process-event-bus-published-after-commit.md)). So this file replaces `openapi.yaml` and has two parts:

- **Part 1 — real-time channel** (Socket.IO): client → server actions with ack, server → client pushes. Shapes live in `apps/server/src/game/presentation` DTOs and in the web composable `useGame`.
- **Part 2 — integration events** (`apps/server/src/shared/events`): consumed `MatchCreated`, published `GameStarted`, `MoveMade`, `GameEnded`, `GameNotStarted`.

Derived from [`data-model.md`](../data-model.md) (fields, bounds, enums), [`sad.md`](../sad.md) §6 (flows and their `alt` branches), §8 (auth, errors, validation, idempotency), and [`PRD.md`](../PRD.md) §4–§6.1. Drift check: [`api-sync-report.md`](./api-sync-report.md).

---

## Part 1 — Real-time channel (Socket.IO)

### Channel: default namespace `/`

- **Producer / server:** `GameGateway` in `game/presentation`.
- **Consumers / clients:** `useGame(id)` in `apps/web/app/composables/` — every tab of both players.
- **Transport:** Socket.IO over WSS through the Cloudflare Tunnel (sad.md §7). Heartbeat `pingInterval + pingTimeout < 10 s` (PRD §6 offline marker, ADR-0002).
- **Rooms:** `game:<gameId>`; a socket enters the room only after a successful `game:join`.
- **Delivery:** pushes are best-effort; the full `game:snapshot` after (re)join is the only recovery path. Actions are emitted **only while `socket.connected`**; the client's emit buffer is never relied on (ADR-0002, AC-27b).
- **Ordering:** all actions of one game go through that game's queue (ADR-0003); pushes for a game are emitted in commit order.
- **Field naming:** one rule for the whole contract — a DB column in `snake_case` becomes a payload field in `camelCase` (`position_fen` → `positionFen`), matching ADR-0006. Error codes and enum values stay `snake_case` (`game.not_your_turn`, `draw_agreement`); Socket.IO event names are `game:<action>`. Clients never send time, results or remaining clocks — unknown fields are rejected (sad.md §8, PRD §6.1).

### Handshake (authentication)

- Identity: the Cloudflare Access session the browser already carries (`CF_Authorization` cookie / `Cf-Access-Jwt-Assertion`), read by the `CurrentPerson` port (game-play [ADR-0008](../adr/0008-cloudflare-access-identity-until-auth-feature.md)). The adapter verifies signature + audience; the email never leaves the adapter. Local dev: dev-only adapter.
- The handshake carries **no** game data and no client-chosen identity.
- Failure → Socket.IO `connect_error` with `data: Error` (`auth.unauthenticated`); the client asks the person to sign in again (§6 `Open a game` — `alt identity invalid`). A person who is not signed in never reaches the page — Cloudflare's login screen handles AC-05.

### Common shapes

#### `Error`

```json
{ "code": "game.not_your_turn", "message": "It is not your turn.", "details": {} }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `code` | string, `module.error_name` | yes | one of the codes in [Error codes](#error-codes) |
| `message` | string | yes | human-readable, English; the UI may show its own copy |
| `details` | object | no | machine hints, e.g. `{ "retryAfter": "own_half_move" }` |

#### `Ack`

Every client → server action is emitted with an ack callback. The client sets an ack timeout; no ack before the timeout means the action is **pending**, never resent — the next snapshot decides (ADR-0002, AC-27b).

```jsonc
// accepted
{ "ok": true, "snapshot": { /* GameSnapshot */ } }
// rejected — the snapshot lets the client restore the board (AC-02 piece returns) and resync
{ "ok": false, "error": { "code": "game.illegal_move", "message": "That move is not legal." }, "snapshot": { /* GameSnapshot */ } }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `ok` | boolean | yes | |
| `snapshot` | `GameSnapshot` | yes when `ok`; when rejected — present except for `game.not_found`, `game.invalid_message`, `game.internal_error` | never sent for `game.not_found`, so a link reveals nothing (AC-04) |
| `error` | `Error` | yes when not `ok` | |
| `you` | `"white" \| "black"` | only on `game:join` | the recipient's colour → board orientation (AC-06) |

**Idempotency:** every action except `game:join` carries `commandId` (UUID, client-generated). A repeat of an **accepted** `commandId` in the same game returns `{ ok: true, snapshot }` with the current snapshot and changes nothing (`game_commands`, ADR-0003, AC-29). A rejected command is not recorded; its repeat is evaluated again. TTL: for the life of the game (rows are never deleted).

#### `GameSnapshot`

The full state of one game; identical for every socket in the room. Sent in acks and as the `game:snapshot` push.

| Field | Type | Origin | Notes |
|---|---|---|---|
| `gameId` | string (uuid) | `games.id` | |
| `status` | `"active" \| "ended" \| "aborted"` | `games.status` | |
| `timeControl` | `{ baseSeconds: integer, incrementSeconds: integer }` | `games.base_seconds`, `games.increment_seconds` | fixed for the game (AC-06) |
| `players` | `{ white: PlayerCard, black: PlayerCard }` | `games.*_nickname`, `games.*_rating` | no player ids, no email (PRD §6.1) |
| `positionFen` | string, `maxLength: 100` | `games.position_fen` | the client parses the placement + side-to-move fields |
| `halfMoveCount` | integer ≥ 0 | `games.half_move_count` | `< 2` ⇒ abort window, only Cancel allowed (AC-32b, AC-33) |
| `lastMoveUci` | string \| null, pattern `^[a-h][1-8][a-h][1-8][qrbn]?$` | `half_moves.move_uci` where `number = games.half_move_count` | null before the first half-move; for the last-move highlight |
| `clock` | `Clock` | see below | |
| `drawOfferedBy` | `"white" \| "black" \| null` | `games.draw_offered_by` | the waiting draw offer (AC-14b) |
| `drawBlocked` | `{ white: boolean, black: boolean }` | `games.white_draw_blocked`, `games.black_draw_blocked` | true ⇒ that side's offer was declined and it has not moved since (AC-15); the offerer shows «declined» when its offer disappears and its flag turns true (AC-14) |
| `result` | `Result \| null` | `games.end_reason`, `games.winner_color` | non-null only when `status = ended`; null for active and aborted (AC-32, AC-34) |
| `rematchOfferedBy` | `"white" \| "black" \| null` | `rematch_offers.offered_by` where `closed_at IS NULL` | survives going offline (AC-24); its disappearance = «the rematch will not happen» (AC-25) |
| `rematchGameId` | string (uuid) \| null | `games.id` where `previous_game_id` = this game's `id` | set once a rematch started; both clients navigate to it (AC-22) |
| `presence` | `{ white: boolean, black: boolean }` | in-memory presence registry (ADR-0007) — no column | online = at least one tab/device has the game open (AC-31) |

`PlayerCard`:

| Field | Type | Origin |
|---|---|---|
| `nickname` | string, `maxLength: 32` | `games.white_nickname` / `games.black_nickname` (bound provisional — data-model TBD) |
| `rating` | integer \| null | `games.white_rating` / `games.black_rating` — null = no rating (AC-30) |

`Clock` — remaining times computed by the server **at send time**; never an absolute deadline (ADR-0004 (a)). The client counts down from the moment the message arrived using a monotonic timer.

| Field | Type | Origin | Notes |
|---|---|---|---|
| `whiteRemainingMs` | integer ≥ 0 | `games.white_remaining_ms` − elapsed since `games.turn_started_at` if White's clock runs | |
| `blackRemainingMs` | integer ≥ 0 | same for Black | |
| `running` | `"white" \| "black" \| null` | derived: side to move when `status = active` and `halfMoveCount ≥ 2`, else null | main clock does not run in the abort window (AC-33) |
| `abortRemainingMs` | integer ≥ 0 \| null | derived: abort window (20 000 ms when `games.base_seconds` is 180 or 300, 60 000 ms when 600) − elapsed since `turn_started_at`, while `status = active` and `halfMoveCount < 2` | the countdown both players see (AC-32, AC-33) |

`Result`:

| Field | Type | Origin |
|---|---|---|
| `endReason` | `"mate" \| "resign" \| "timeout" \| "draw_agreement" \| "stalemate" \| "insufficient_material" \| "threefold_repetition" \| "fifty_move_rule" \| "timeout_vs_insufficient_material"` | `games.end_reason` |
| `winnerColor` | `"white" \| "black" \| null` | `games.winner_color` — null = Draw |

Example (`game:join` ack, White's view, game in progress):

```json
{
  "ok": true,
  "you": "white",
  "snapshot": {
    "gameId": "01934b7e-0000-7000-8000-000000000001",
    "status": "active",
    "timeControl": { "baseSeconds": 180, "incrementSeconds": 2 },
    "players": {
      "white": { "nickname": "Test White", "rating": null },
      "black": { "nickname": "Test Black", "rating": 1500 }
    },
    "positionFen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "halfMoveCount": 2,
    "lastMoveUci": "e7e5",
    "clock": { "whiteRemainingMs": 181200, "blackRemainingMs": 182000, "running": "white", "abortRemainingMs": null },
    "drawOfferedBy": null,
    "drawBlocked": { "white": false, "black": false },
    "result": null,
    "rematchOfferedBy": null,
    "rematchGameId": null,
    "presence": { "white": true, "black": true }
  }
}
```

### Client → server actions

All carry `gameId` (uuid). All except `game:join` carry `commandId` (uuid). The server checks, in this order: message valid → person is one of the game's two players (else `game.not_found`) → game state rules → apply in one transaction → ack → push `game:snapshot` to the room → publish integration events after commit.

| Event | Payload (besides `gameId`, `commandId`) | Success | Errors (beyond `game.invalid_message`, `game.not_found`, `game.internal_error`) | Origin |
|---|---|---|---|---|
| `game:join` | — (no `commandId`) | ack `{ ok, you, snapshot }`; socket joins `game:<id>` | — | §6 `Open a game`; AC-04, AC-06, AC-27, AC-30 |
| `game:move` | `uci`: string, pattern `^[a-h][1-8][a-h][1-8][qrbn]?$` (promotion piece included — AC-03) | ack ok; snapshot push; `MoveMade` (+ `GameEnded` if it ended the game) | `game.not_your_turn`, `game.illegal_move`, `game.over` (incl. own deadline already passed — the game ends by Timeout first, AC-10) | §6 `Critical flow 1`, `Promote a pawn`, `Half-move against the clock`, `A half-move ends the game`; AC-01–03, AC-07, AC-10, AC-17–19 |
| `game:resign` | — | ack ok with `result`; `GameEnded` | `game.not_started`, `game.over` | §6 `Resign with confirmation`; AC-11, AC-20, AC-32b |
| `game:cancel` | — | ack ok, `status = aborted` | `game.cancel_not_allowed`, `game.over` | §6 `Abort a game nobody started`; AC-32b |
| `game:offer_draw` | — | ack ok, `drawOfferedBy` set — or the game ends as `draw_agreement` if the opponent's offer is waiting (AC-16); a repeat while the own offer waits → ok, still one offer | `game.not_started`, `game.draw_offer_blocked`, `game.over` | §6 `Offer and answer a draw`; AC-14b, AC-15, AC-16 |
| `game:accept_draw` | — | ack ok, `result.endReason = draw_agreement`; `GameEnded` | `game.no_offer`, `game.over` | AC-13, AC-20 |
| `game:decline_draw` | — | ack ok, offer gone, offerer's `drawBlocked` true | `game.no_offer`, `game.over` | AC-14 |
| `game:offer_rematch` | — | ack ok, `rematchOfferedBy` set — or, if the opponent's offer is waiting, it counts as acceptance (see `game:accept_rematch`); a repeat → ok, one offer (AC-23) | `game.rematch_not_allowed`, `game.opponent_offline` (when it turns into acceptance), `game.player_has_active_game` | §6 `Rematch accepted`; AC-22, AC-23 |
| `game:accept_rematch` | — | ack ok with `rematchGameId`; push to the room; `GameStarted` for the new game | `game.no_offer`, `game.opponent_offline` (AC-24b — the offer stays), `game.player_has_active_game` (AC-22b), `game.rematch_not_allowed` | §6 `Rematch accepted`; AC-22, AC-22b, AC-24b |
| `game:close_rematch` | — | ack ok, `rematchOfferedBy` null. Sent for Decline (opponent), Cancel (offerer) and New game (either player, before navigating — AC-26). An idempotent no-op when no offer waits | `game.rematch_not_allowed` | §6 `Rematch offer kept or withdrawn`; AC-25, AC-26 |

Not messages, by design: closing the promotion choice (AC-03) and cancelling the resign confirmation (AC-12) happen only in the client — nothing is sent and the clock keeps running. Starting another game cancels open rematch offers inside that game's creation transaction (AC-25b); players of the affected game get a `game:snapshot` push.

### Server → client pushes

| Event | Payload | When | Origin |
|---|---|---|---|
| `game:snapshot` | `GameSnapshot` | after every committed change of the game — action, timeout, abort by window, a rematch started or an offer closed by another game's creation | §6 all flows; ADR-0003 (broadcast after commit) |
| `game:presence` | `{ gameId: uuid, presence: { white: boolean, black: boolean } }` | a player's first tab joins / last tab disconnects (after the heartbeat misses) | §6 `Critical flow 3`; AC-24, AC-31; PRD §6 offline ≤ 10 s, online ≤ 3 s |

### Error codes

No central error registry exists in the repo yet; these codes are this contract's proposal (see the report, point 2).

| Code | Meaning | Where | Origin |
|---|---|---|---|
| `auth.unauthenticated` | no valid signed identity | `connect_error` | §6 `Open a game` `alt identity invalid`; ADR-0008 |
| `game.not_found` | no such game **or** the person is not one of its players — identical reply | any action | AC-04; §6 `Open a game` |
| `game.invalid_message` | payload fails validation or has unknown fields | any action | sad.md §8 Validation |
| `game.not_your_turn` | half-move by the side not to move | `game:move` | AC-02; §6 `Critical flow 1` |
| `game.illegal_move` | illegal half-move | `game:move` | AC-02; §6 `Critical flow 1` |
| `game.over` | the game has ended or was aborted; snapshot carries the stored outcome | move, resign, cancel, draw actions | AC-20; §6 `Half-move against the clock`, `Resign with confirmation`, `Offer and answer a draw`, `A half-move ends the game` |
| `game.not_started` | Resign / Offer draw while a side has not made its first half-move — only Cancel | resign, offer_draw | AC-32b; §6 `Resign …` / `Offer …` abort-window branch |
| `game.cancel_not_allowed` | both sides already made their first half-move | `game:cancel` | §6 `Abort a game nobody started` |
| `game.draw_offer_blocked` | own offer was declined, no own half-move since; `details.retryAfter = "own_half_move"` | `game:offer_draw` | AC-15 |
| `game.no_offer` | no waiting offer from the opponent to accept / decline | accept/decline draw, accept_rematch | contract guard (accepted, report point 5) |
| `game.rematch_not_allowed` | rematch action on an active or aborted game | rematch actions | AC-32 «only New game» for aborted; contract guard for active |
| `game.opponent_offline` | the offering player is offline; the offer stays | `game:accept_rematch`, `game:offer_rematch` when it becomes acceptance | AC-24b |
| `game.player_has_active_game` | a player of the pair already has an active game; no new game | rematch acceptance | AC-22b; `player_active_games` PK |
| `game.internal_error` | storage failure; nothing was applied | any action | contract guard (accepted, report point 5) |

---

## Part 2 — Integration events (`shared/events`)

### Channel: in-process event bus

- **Transport:** in-process bus behind the `EventPublisher` port in each context's `application` (ADR-0006); e.g. `@nestjs/event-emitter`.
- **Delivery:** **at-most-once** — published only after the ADR-0003 transaction commits; a crash between commit and publish loses the event. The stored game row stays the source of truth (AC-21).
- **Ordering:** in commit order per `gameId` (one queue per game); consumers must still tolerate a missing event.
- **Handlers:** asynchronous and isolated — a consumer's failure is logged and never reaches the player's action (ADR-0006 (a)).
- **Field naming:** `camelCase` — the TypeScript classes in `shared/events`, names as fixed in ADR-0006 (`matchId`, `playerId`); the same rule as Part 1. Deviation from the skill's `snake_case` default, by ADR-0006, for the whole contract.
- **Privacy:** no email, no Cloudflare identity in any event (ADR-0006, ADR-0008).

### Envelope

```jsonc
{
  "type": "game.move_made",   // module.action
  "version": 1,
  "occurredAt": "2026-11-16T12:00:00.000Z",
  "data": { /* per event */ }
}
```

No `eventId`: consumers dedupe by `gameId` (+ `number` for `MoveMade`) as ADR-0006 fixes.

### Event: `match.created.v1` — `MatchCreated` (consumed)

- **Producer:** match context; until it ships, the temporary dev-only pairing CLI in `match/presentation` (sad.md §5 — no `cli.md` by decision, see the report).
- **Consumer:** game — `CreateGameFromPairing`.

| Field | Type | Origin |
|---|---|---|
| `matchId` | uuid | → `games.match_id` (idempotency key) |
| `timeControl` | `{ baseSeconds: integer, incrementSeconds: integer }` | → `games.base_seconds`, `games.increment_seconds`; offered values 3+2, 5+0, 10+0 (PRD §1) |
| `white` / `black` | `{ playerId: uuid, nickname: string ≤ 32, rating: integer \| null }` | → `games.*_player_id`, `*_nickname`, `*_rating` (ADR-0006) |

Example: `{ "type": "match.created", "version": 1, "occurredAt": "…", "data": { "matchId": "01934b7e-0000-7000-8000-0000000000a1", "timeControl": { "baseSeconds": 300, "incrementSeconds": 0 }, "white": { "playerId": "01934b7e-0000-7000-8000-0000000000b1", "nickname": "Test White", "rating": null }, "black": { "playerId": "01934b7e-0000-7000-8000-0000000000b2", "nickname": "Test Black", "rating": null } } }`

Outcomes (§6 `Create a game from a pairing`): game created → `GameStarted`; duplicate `matchId` → ignored, no event; a player already has an active game → `GameNotStarted`; store failure → logged ERROR, no game, no event (open question, sad.md §11).

### Event: `game.started.v1` — `GameStarted`

- **Producer:** game, after the creation transaction (pairing or accepted rematch).
- **Consumers:** none yet (match, boost, player — future). Rematch-rate KPI (PRD §7) reads `previousGameId`.

| Field | Type | Origin |
|---|---|---|
| `gameId` | uuid | `games.id` |
| `matchId` | uuid \| null | `games.match_id` — null for a rematch |
| `previousGameId` | uuid \| null | `games.previous_game_id` — set for a rematch (ADR-0007) |
| `whitePlayerId` / `blackPlayerId` | uuid | `games.white_player_id` / `black_player_id` |
| `timeControl` | `{ baseSeconds, incrementSeconds }` | `games.base_seconds`, `games.increment_seconds` |

`occurredAt` = `games.created_at`.

### Event: `game.move_made.v1` — `MoveMade`

- **Producer:** game, after every accepted half-move.
- **Consumers:** boost (future) — counts half-moves, finds free squares.

| Field | Type | Origin |
|---|---|---|
| `gameId` | uuid | `half_moves.game_id` |
| `number` | integer ≥ 1 | `half_moves.number` — dedupe key with `gameId` |
| `moveUci` | string, pattern `^[a-h][1-8][a-h][1-8][qrbn]?$` | `half_moves.move_uci` |
| `positionFen` | string ≤ 100 | `half_moves.position_fen` — position after the half-move |

`occurredAt` = `half_moves.created_at`. When a half-move ends the game, `MoveMade` is published before `GameEnded`.

### Event: `game.ended.v1` — `GameEnded`

- **Producer:** game, once per game end (Mate, Resign, Timeout, Draw). **Never for an aborted game** (AC-34).
- **Consumers:** player / rating (future) — must treat the stored game end as the source of truth (at-most-once, sad.md §6 flags).

| Field | Type | Origin |
|---|---|---|
| `gameId` | uuid | `games.id` |
| `endReason` | same enum as `Result.endReason` | `games.end_reason` |
| `winnerColor` | `"white" \| "black" \| null` | `games.winner_color` |
| `whitePlayerId` / `blackPlayerId` | uuid | `games.white_player_id` / `black_player_id` |

`occurredAt` = `games.finished_at`.

### Event: `game.not_started.v1` — `GameNotStarted`

- **Producer:** game, when a `MatchCreated` cannot become a game.
- **Consumers:** match (future).

| Field | Type | Origin |
|---|---|---|
| `matchId` | uuid | from `MatchCreated` |
| `reason` | `"player_has_active_game"` | `player_active_games` PK violation (ADR-0006 (b), AC-22b) |

## Idempotency & retry

- **Socket.IO actions:** `commandId` per game, accepted commands only (above). No server-side retry; the client never resends — it waits for the snapshot (ADR-0002).
- **Integration events:** consumers dedupe on `gameId` (+ `number`). **Retry: none. Dead-letter: none** — at-most-once by ADR-0006; the switch to a transactional outbox is triggered at the boosts / rating architecture-design (sad.md §11). Timer-driven commands (timeout, abort) retry through the 5 s safety sweep (ADR-0004 (b)).
- **`MatchCreated` handling:** idempotent by `matchId` (`uq_games_match_id`).

## Schema registry

- Canonical types: TypeScript classes in `apps/server/src/shared/events/` (integration events) and DTOs in `apps/server/src/game/presentation/` (Socket.IO messages). None exist yet.
- Validator: none in the repo yet — sad.md §8 requires schema-validated DTOs with unknown fields rejected; the library is chosen in implement-tasks.
