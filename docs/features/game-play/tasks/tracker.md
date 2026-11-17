# Tracker — game-play

> Status of every task in the epic. `implement-tasks` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | [Bootstrap the NestJS server with Jest so make test, make arch and make typecheck pass](./t01-server-skeleton.md) | wiring | Gleb Bufin | M | — | todo |
| T2 | [Create the shared @chessboost/contracts package with typed Socket.IO events from events.md](./t02-shared-contracts-package.md) | wiring | Gleb Bufin | M | T1 | todo |
| T3 | [Spike the deadline clock: TimeControl, Clock and the TimeSource port](./t03-clock-spike.md) | domain | Gleb Bufin | M | T1 | todo |
| T4 | [Add the ChessRules port and its chess.js adapter](./t04-chess-rules-port.md) | infra | Gleb Bufin | M | T1 | todo |
| T5 | [Build the Game aggregate: creation, half-moves, game-end precedence, material rules and time checks](./t05-game-aggregate-core.md) | domain | Gleb Bufin | L | T3, T4 | todo |
| T6 | [Add resign, cancel and draw offers to the Game aggregate](./t06-game-aggregate-offers.md) | domain | Gleb Bufin | M | T5 | todo |
| T7 | [Write the Drizzle schema for the 5 game-play tables, generate the migration and diff it against the staged SQL](./t07-drizzle-schema-and-generated-migration.md) | migration | Gleb Bufin | M | T1 | todo |
| T8 | [Implement DrizzleGameRepository with one transaction per action, a version check and the command ledger](./t08-drizzle-game-repository.md) | infra | Gleb Bufin | L | T6, T7 | todo |
| T9 | [Build the per-game command queue and pipeline with MakeHalfMove and GetSnapshot](./t09-command-pipeline.md) | app | Gleb Bufin | L | T8 | todo |
| T10 | [Add TimerService: one timer per game, CheckTime, re-arm on boot and the 5 s safety sweep](./t10-timer-service.md) | app | Gleb Bufin | M | T9 | todo |
| T11 | [Publish integration events after commit and create games from MatchCreated](./t11-integration-events-and-game-creation.md) | app | Gleb Bufin | M | T9 | todo |
| T12 | [Add the in-memory PresenceRegistry that counts a player's tabs per game](./t12-presence-registry.md) | app | Gleb Bufin | S | T1 | todo |
| T13 | [Add the CurrentPerson port and a dev-only adapter](./t13-current-person-adapters.md) | infra | Gleb Bufin | S | T1 | todo |
| T14 | [Build GameGateway: handshake identity, rooms, game:join, game:move, snapshots and presence](./t14-game-gateway-core.md) | ports | Gleb Bufin | L | T2, T9, T12, T13 | todo |
| T15 | [Wire resign, cancel and the draw actions end to end: use cases and gateway handlers](./t15-resign-cancel-draw-slice.md) | ports | Gleb Bufin | M | T14 | todo |
| T16 | [Wire the rematch end to end: offer, accept into a new game, close](./t16-rematch-slice.md) | ports | Gleb Bufin | L | T11, T14 | todo |
| T17 | [Bind game.module, re-arm timers on boot and add the temporary create-pairing CLI](./t17-module-wiring-and-pairing-cli.md) | wiring | Gleb Bufin | M | T10, T11, T15, T16 | todo |
| T18 | [Add the useGame composable: typed socket, snapshot state, local countdown, commandId and acks](./t18-use-game-composable.md) | ui | Gleb Bufin | L | T2 | todo |
| T19 | [Add the /game/[id] page that maps GameSnapshot to GameView, with skeleton and presence](./t19-game-page-and-snapshot-mapping.md) | ui | Gleb Bufin | M | T18 | todo |
| T20 | [Send half-moves from the board, roll back rejected ones, add the promotion picker and the move sound](./t20-board-moves-and-promotion.md) | ui | Gleb Bufin | M | T19 | todo |
| T21 | [Wire GameActions: resign with confirmation, the draw offer states and Cancel in the abort window](./t21-game-actions.md) | ui | Gleb Bufin | M | T19 | todo |
| T22 | [Add the result screen with end-reason texts, the aborted state, Rematch and New game](./t22-result-screen-and-rematch.md) | ui | Gleb Bufin | L | T19 | todo |
| T23 | [Run end-to-end scripted games through two browser sessions against the real server and database](./t23-e2e-scripted-games.md) | tests | Gleb Bufin | L | T17, T20, T21, T22 | todo |

**Total:** 23 tasks, ~15.25 person-days (S = 2 h, M = half a day, L = one day).

## Deferred (not in tasks.json)

| # | Task | When | Status |
|---|---|---|---|
| T13-CF | [Add the Cloudflare Access JWT adapter for CurrentPerson](./deferred/cf-access-adapter.md) | before the first game on the NAS | deferred |
