---
id: T2
title: "Create the shared @chessboost/contracts package with typed Socket.IO events from events.md"
layer: "wiring"
deps: ["T1"]
acs: []
files_hint: ["packages/contracts/", "pnpm-workspace.yaml"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T2 — Create the shared @chessboost/contracts package with typed Socket.IO events from events.md

## Why

Server and web must compile against one set of message types, transcribed from [contracts/events.md](../contracts/events.md) Part 1. Without this, the gateway (T14) and `useGame` (T18) would each retype the contract and drift.

**ACs:** none (enabling task) · **Blocked by:** T1 · **Estimate:** M

## What

- New workspace package `packages/contracts` (`@chessboost/contracts`). Add `packages/*` to `pnpm-workspace.yaml`.
- Types: `ClientToServerEvents` / `ServerToClientEvents` (Socket.IO typed event maps for the 10 actions `game:join` … `game:close_rematch` and the pushes `game:snapshot`, `game:presence`), the action payloads (`gameId`, `commandId`, `uci`), `Ack`, `GameSnapshot` and its parts (`TimeControl`, `Players`, `Clock`, `Result`, `Presence`), `GameError {code, message, details}`, `ErrorCode` (the 14 codes, e.g. `game.not_your_turn`, `auth.unauthenticated`), the enums (status, 9 end reasons, colour) and `details.retryAfter`.
- An exported `CONTRACT_VERSION = "0.1.0"` and a runtime `ERROR_CODES` list.
- Field names are camelCase, exactly as in events.md.
- Integration events (events.md Part 2) are **not** here. They are server-internal and live in `apps/server/src/shared/events` (T11).
- Build approach: emit `dist/` with `tsc`, or consume the TS source, whichever both NestJS (tsc / ts-jest) and Nuxt (Vite) compile. Record the choice in `package.json` `exports`.

**Files:** `packages/contracts/`, `pnpm-workspace.yaml`

## Definition of Done

- [ ] The package typechecks.
- [ ] A compile-time test (`satisfies` checks) asserts every events.md action and push name, all 14 error codes and every `GameSnapshot` field.
- [ ] The server and the web app each import a type from `@chessboost/contracts`, and `make typecheck` plus the web typecheck stay green.
- [ ] `make arch` is green.
- [ ] lint + typecheck clean

## Notes

- On the server, import it only from `game/presentation`: `domain` imports nothing external (`.dependency-cruiser.cjs`), and message shapes live in `presentation` (`.claude/rules/game.md`).
- Any later change to events.md updates this package in the same PR (bump `CONTRACT_VERSION` with the contract).
- Dependencies: T14 and T18 depend on this task.
