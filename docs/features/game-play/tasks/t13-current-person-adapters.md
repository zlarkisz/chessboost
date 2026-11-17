---
id: T13
title: "Add the CurrentPerson port with the Cloudflare Access JWT adapter and a dev-only adapter"
layer: "infra"
deps: ["T1"]
acs: ["AC-04", "AC-05"]
files_hint: ["apps/server/src/game/domain/ports/current-person.ts", "apps/server/src/game/infrastructure/cloudflare-access-current-person.ts", "apps/server/src/game/infrastructure/dev-current-person.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T13 — Add the CurrentPerson port with the Cloudflare Access JWT adapter and a dev-only adapter

## Why

Identity comes from Cloudflare Access until the auth feature exists ([ADR-0008](../adr/0008-cloudflare-access-identity-until-auth-feature.md), [sad §8](../sad.md) Authentication and Privacy).

**ACs:** AC-04, AC-05 ([PRD §5](../PRD.md)) · **Blocked by:** T1 · **Estimate:** M

## What

- `CurrentPerson` port: resolve a player id from the handshake.
- The Cloudflare Access adapter:
  - verifies the signed JWT (signature from the team keys, audience, expiry);
  - maps the email to a player id through an allowlist mapping (config variable names in `.env.example`).
- A dev-only adapter, which refuses to bind in production.
- The email never leaves the adapter.

**Files:** `apps/server/src/game/domain/ports/current-person.ts`, `apps/server/src/game/infrastructure/cloudflare-access-current-person.ts`, `apps/server/src/game/infrastructure/dev-current-person.ts`

## Definition of Done

- [ ] Tests with a locally generated key pair pass for:
  - a valid token resolves to the player;
  - an invalid signature, a foreign audience, an expired token or an unknown email are unauthenticated;
  - the dev adapter throws when bound with `NODE_ENV=production`.
- [ ] lint + typecheck clean

## Notes

- Security review is required before the first game on the NAS ([PRD §6.1](../PRD.md)).
- Real keys are never committed.
