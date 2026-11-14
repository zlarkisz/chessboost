---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0008 — Identify players through Cloudflare Access until the auth feature exists

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

game-play must know who is signed in: only the two players of a game may see it or act in it, and a non-player must not learn whether a game exists (AC-04, AC-05, PRD §6.1). Registration / sign-in is a separate, unbuilt feature (PRD §3; SPEC: OAuth Google/Discord/Twitch). Circle 1 plays on a **public** address (`play.chessboost.games` via Cloudflare Tunnel on the home NAS — sad.md §7), so a development stub where a person picks their own identity would let anyone on the internet act in other people's games.

## Decision drivers

- PRD §6.1: security review required; per-game player authorization; only signed-in persons can open a game.
- The clock spike and the scripted games with friends should not wait for the auth feature (PRD §8).
- Architecture constraint: contexts talk only through ports / `shared/events`; the real identity source must be swappable.

## Considered options

1. **Cloudflare Access in front of the tunnel** — sign-in by a one-time email code, only an allowlist of 3 addresses; the server verifies the signed `Cf-Access-Jwt-Assertion` and maps email to a player.
2. **Wait for the auth feature** — a localhost-only dev adapter; public scripted games only after registration ships.

## Decision outcome

**Chosen:** Option 1. It gives real identity verification for circle 1 with no login code of our own and keeps game-play unblocked; the auth feature later replaces one adapter class behind the same port.

Details fixed by this decision:

- game reads the person through a `CurrentPerson` port at the Socket.IO handshake; the circle-1 adapter verifies the Access JWT's signature (Cloudflare team keys) and audience — the header alone is never trusted — and maps the email to a player.
- Then game checks the person is one of the game's two players on every action (sad.md §8 Authorization).
- People outside the allowlist never reach the page; AC-05 «sign in first» is performed by Cloudflare's login screen, not by our UI.

## Consequences

**Positive**
- Real authentication on a public address from day one, with zero custom login code.
- The port keeps the swap to the auth feature a one-class change.

**Negative**
- Until auth ships, chessboost depends on Cloudflare Access configuration (allowlist, application audience).
- The only protection against abusive action volume is the allowlist; a rate limit on player actions becomes mandatory before registration opens (sad.md §11).

**Neutral**
- Local development uses a dev-only adapter, disabled outside `make dev`.

## Links

- PRD: [[../PRD.md]] §6.1, AC-04, AC-05
- SAD: [[../sad.md]] §7, §8, §11
- Related ADR: [[0002-socket-io-for-realtime-channel]]; repo `docs/adr/0003-uuid-v7-for-entity-ids.md`
