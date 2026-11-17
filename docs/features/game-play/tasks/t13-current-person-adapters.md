---
id: T13
title: "Add the CurrentPerson port and a dev-only adapter"
layer: "infra"
deps: ["T1"]
acs: ["AC-04", "AC-05"]
files_hint: ["apps/server/src/game/domain/ports/current-person.ts", "apps/server/src/game/infrastructure/dev-current-person.ts"]
owner: "Gleb Bufin"
estimate: "S"
status: "todo"
---

# T13 — Add the CurrentPerson port and a dev-only adapter

## Why

Identity comes from Cloudflare Access until the auth feature exists ([ADR-0008](../adr/0008-cloudflare-access-identity-until-auth-feature.md), [sad §8](../sad.md) Authentication and Privacy). Module 7 runs game-play locally only, so this task ships the port and the dev adapter; the Cloudflare Access adapter is deferred to the deploy ([deferred/cf-access-adapter.md](./deferred/cf-access-adapter.md)). The port keeps the swap local to one binding.

**ACs:** AC-04, AC-05 — the missing-identity part only; token checks move with the deferred adapter ([PRD §5](../PRD.md)) · **Blocked by:** T1 · **Estimate:** S

## What

- `CurrentPerson` port: resolve a player id from the handshake, or report the connection as unauthenticated.
- A dev-only adapter:
  - resolves the player id the local session presents;
  - a handshake without an identity is unauthenticated;
  - refuses to bind in production.

**Files:** `apps/server/src/game/domain/ports/current-person.ts`, `apps/server/src/game/infrastructure/dev-current-person.ts`

## Definition of Done

- [ ] Tests pass for:
  - a handshake with a dev identity resolves to the player;
  - a handshake without an identity is unauthenticated;
  - the dev adapter throws when bound with `NODE_ENV=production`.
- [ ] lint + typecheck clean

## Notes

- Not in scope: the Cloudflare Access JWT adapter — see [deferred/cf-access-adapter.md](./deferred/cf-access-adapter.md).
