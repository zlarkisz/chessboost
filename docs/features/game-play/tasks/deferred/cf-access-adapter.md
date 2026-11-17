---
id: T13-CF
title: "Add the Cloudflare Access JWT adapter for CurrentPerson"
layer: "infra"
deps: ["T13"]
acs: ["AC-05"]
files_hint: ["apps/server/src/game/infrastructure/cloudflare-access-current-person.ts"]
owner: "Gleb Bufin"
estimate: "M"
status: "deferred"
---

# T13-CF — Add the Cloudflare Access JWT adapter for CurrentPerson

> **Deferred — not in [tasks.json](../tasks.json) on purpose**, so `implement-tasks` does not pick it up.
> Do it before the first game on the NAS (deploy, course module 11) — unless the auth feature ships first and
> replaces Cloudflare Access ([ADR-0008](../../adr/0008-cloudflare-access-identity-until-auth-feature.md) stays as decided; only the timing moved).

## Why

Identity comes from Cloudflare Access until the auth feature exists ([ADR-0008](../../adr/0008-cloudflare-access-identity-until-auth-feature.md), [sad §8](../../sad.md) Authentication and Privacy). Split out of [T13](../t13-current-person-adapters.md) on 2026-11-17: game-play is built and played locally first.

**ACs:** AC-05 — the token part ([PRD §5](../../PRD.md)) · **Blocked by:** T13 · **Estimate:** M

## What

- The Cloudflare Access adapter behind the `CurrentPerson` port:
  - verifies the signed JWT (signature from the team keys, audience, expiry);
  - maps the email to a player id through an allowlist mapping (config variable names in `.env.example`).
- The email never leaves the adapter.
- Production binds this adapter; the dev adapter keeps refusing production.

**Files:** `apps/server/src/game/infrastructure/cloudflare-access-current-person.ts`

## Definition of Done

- [ ] Tests with a locally generated key pair pass for:
  - a valid token resolves to the player;
  - an invalid signature, a foreign audience, an expired token or an unknown email are unauthenticated.
- [ ] lint + typecheck clean
- [ ] When done: add it back to `tasks.json` / `tracker.md` as a normal task, or close it if auth replaced it.

## Notes

- Security review is required before the first game on the NAS ([PRD §6.1](../../PRD.md)).
- Real keys are never committed.
