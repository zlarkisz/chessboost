---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0002 — Use Socket.IO as the real-time channel between server and players

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

game-play is the project's first real-time channel between players. `CLAUDE.md` fixes `@nestjs/websockets`, which runs on one of two adapters: Socket.IO or plain `ws`. The channel must carry a player's actions to the server, the server's state to every tab of both players, and must notice a dead connection quickly. Changing it later touches the server gateway and the client composable.

## Decision drivers

- PRD §6: offline marker shown ≤ 10 s after the opponent loses connection; online ≤ 3 s after return.
- PRD §6: return to a game — current position and clocks shown ≤ 3 s after reopening.
- AC-29: one player in two tabs or devices sees the same position; a half-move is made once.
- AC-27b: after a drop right after a half-move, the half-move counts only if the game accepted it.
- One developer: protocol plumbing written by hand is where edge-case bugs hide.

## Considered options

1. **Socket.IO** (`@nestjs/platform-socket.io` + `socket.io-client`) — rooms, acks, configurable heartbeat, automatic reconnection, cookies available at handshake.
2. **Plain WebSocket** (`@nestjs/platform-ws` + browser `WebSocket` / `useWebSocket` from `@vueuse/core`) — standard protocol, fewer dependencies; rooms, request/response correlation, heartbeat and reconnection written by hand.

## Decision outcome

**Chosen:** Option 1. Rooms (`game:<id>`), acks and a tunable heartbeat cover the offline-marker, return-to-game and two-tabs requirements out of the box; the hand-written equivalents are exactly where the riskiest edge cases live.

## Consequences

**Positive**
- One broadcast per game reaches every tab of both players (AC-29).
- Heartbeat (`pingInterval` + `pingTimeout` < 10 s) gives the offline marker; reconnection is automatic.
- Each action gets an explicit «accepted / rejected» reply via ack.

**Negative**
- Own wire protocol: a plain WebSocket client cannot connect; ~15 KB gzip on the client.
- **The Socket.IO client buffers `emit` calls while disconnected by default and sends them after reconnecting — this contradicts AC-27b** (a half-move the player thinks was lost could be replayed later). Rule: actions are sent only when `socket.connected` is true; every action carries an ack with a timeout, and no ack means the half-move was not made; after a reconnect the client always takes a full snapshot from the server and never relies on the buffer.
- Several server processes would need a shared adapter (e.g. Redis) — out of scope while the stack has one process (sad.md §2).

**Neutral**
- The message shapes live in `game/presentation` DTOs and in `contracts/events.md` (api-forge), not in `domain`.

## Links

- PRD: [[../PRD.md]] §6, AC-27, AC-27b, AC-29, AC-31
- SAD: [[../sad.md]] §4
- Related ADR: [[0003-persist-each-action-before-broadcast-with-per-game-queue]]
