---
id: T14
title: "Build GameGateway: handshake identity, rooms, game:join, game:move, snapshots and presence"
layer: "ports"
deps: ["T2", "T9", "T12", "T13"]
acs: ["AC-01", "AC-02", "AC-04", "AC-05", "AC-27", "AC-29", "AC-30", "AC-31"]
files_hint: ["apps/server/src/game/presentation/game.gateway.ts", "apps/server/src/game/presentation/dto/", "apps/server/src/game/presentation/error-mapping.ts"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T14 — Build GameGateway: handshake identity, rooms, game:join, game:move, snapshots and presence

## Why

Socket.IO with rooms `game:<id>`, acks and heartbeat ([ADR-0002](../adr/0002-socket-io-for-realtime-channel.md)). Messages: [events.md](../contracts/events.md) Part 1. Flows: `Open a game`, `Critical flow 1`, `Critical flow 3`.

**ACs:** AC-01, AC-02, AC-04, AC-05, AC-27, AC-29, AC-30, AC-31 ([PRD §5](../PRD.md)) · **Blocked by:** T2, T9, T12, T13 · **Estimate:** L

## What

- Install `@nestjs/websockets`, `@nestjs/platform-socket.io` and `socket.io`.
- The gateway is typed with `ClientToServerEvents` / `ServerToClientEvents` from `@chessboost/contracts` (T2).
- Handshake → `CurrentPerson`. On failure, `connect_error` with `auth.unauthenticated`.
- `game:join` → authorize, join room `game:<id>`, register presence, ack with the snapshot and `you`.
- `game:move` → `MakeHalfMove`.
- DTO validation: an unknown field → `game.invalid_message`.
- Domain error → ack `{ok: false, error}`. No exception reaches the socket.
- `GameBroadcaster` implementation: `game:snapshot` to the room after commit, and `game:presence` on transitions.
- Heartbeat: `pingInterval` + `pingTimeout` < 10 s.
- Structured logs with `gameId`, `halfMove`, `commandId` and the accept time.

**Files:** `apps/server/src/game/presentation/game.gateway.ts`, `apps/server/src/game/presentation/dto/`, `apps/server/src/game/presentation/error-mapping.ts`

## Definition of Done

- [ ] Integration tests with `socket.io-client` against a Nest test app pass for:
  - a non-player and a missing game get an identical error;
  - an unauthenticated connection is rejected;
  - a move reaches every socket in the room as a `game:snapshot`, including a second tab;
  - an extra field is rejected;
  - after a disconnect, offline is pushed to the opponent.
- [ ] lint + typecheck clean

## Notes

- Shares `game.gateway.ts` with T15 and T16, so those run after this task.
