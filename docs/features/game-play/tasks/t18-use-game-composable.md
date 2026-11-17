---
id: T18
title: "Add the useGame composable: typed socket, snapshot state, local countdown, commandId and acks"
layer: "ui"
deps: ["T2"]
acs: ["AC-07", "AC-27", "AC-27b", "AC-29"]
files_hint: ["apps/web/app/composables/useGame.ts", "apps/web/vitest.config.ts", "apps/web/nuxt.config.ts"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T18 — Add the useGame composable: typed socket, snapshot state, local countdown, commandId and acks

## Why

One composable owns the live game state ([sad §4](../sad.md) UI-architecture). Rules for actions while disconnected: [ADR-0002](../adr/0002-socket-io-for-realtime-channel.md). Flow: `Critical flow 3`.

**ACs:** AC-07, AC-27, AC-27b, AC-29 ([PRD §5](../PRD.md)) · **Blocked by:** T2 · **Estimate:** L

## What

- Install `socket.io-client`. Add a web test runner (vitest, unless plan-tests chooses otherwise) and `test` / `typecheck` scripts.
- Set `routeRules: { "/game/**": { ssr: false } }`.
- `useGame(id)` uses the typed socket from `@chessboost/contracts`:
  - connect and `game:join`; state comes from `game:snapshot`;
  - local countdown with monotonic time from receipt, active side only;
  - `commandId = crypto.randomUUID()` per action;
  - actions are sent only while connected, with an ack and a timeout. There is no emit buffer and no resend;
  - no ack → the half-move stays pending until the next snapshot;
  - on reconnect → `game:join` again.

**Files:** `apps/web/app/composables/useGame.ts`, `apps/web/vitest.config.ts`, `apps/web/nuxt.config.ts`

## Definition of Done

- [ ] Composable tests with a fake socket pass for:
  - a snapshot updates the state;
  - the countdown runs only for the active side;
  - while disconnected an action is refused locally and nothing is emitted;
  - an ack timeout keeps the move pending until the next snapshot;
  - a reconnect re-joins.
- [ ] The web typecheck is green.
- [ ] lint + typecheck clean

## Notes

- Depends only on T2, not on server code, so the web branch runs in parallel with the server.
