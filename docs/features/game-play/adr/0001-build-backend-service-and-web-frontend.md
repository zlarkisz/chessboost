---
status: Accepted
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
---

# 0001 — Build game-play as a backend service plus the existing web frontend

- **Status:** Accepted
- **Date:** 2026-11-14
- **Deciders:** Gleb Bufin (with Claude during the architecture-design walk)

## Context

PRD §1/§4: a player plays in the browser, while the server alone decides legality, time and the game end (PRD §6.1). The server side is an empty scaffold (`apps/server/src/game/`), and the web app has only static game-screen components (`apps/web/app/components/game/`, `/game/demo`). We need to decide which deployable parts (C4 containers) this feature introduces or owns, because every downstream stage (contract form, task layers, test tiers) is gated by it.

## Decision drivers

- QG-1 Single authoritative outcome — the result must be decided in one place, not on a player's screen (PRD §6.1).
- PRD §5 criteria about what a player sees (offline marker, result screen, move sound, resign confirmation) are measured by the scripted games (PRD §7).
- Constraint (§2): existing Nuxt 4 + shadcn-vue app and NestJS server in one monorepo.

## Considered options

1. **`[backend-service, web-frontend]`** — the NestJS server owns the real-time contract and the state; the existing Nuxt app consumes it.
2. **`[backend-service]` only** — the feature is the server and its contract; wiring the game screen is left to a later feature.

## Decision outcome

**Chosen:** Option 1. Half of the acceptance criteria are about what the player sees; without the web surface they would have no owner, and the scripted games that gate boosts could not run.

## Consequences

**Positive**
- Every PRD AC has an owning surface; the scripted games can run end to end.
- Downstream stages get the real-time contract (`contracts/events.md`), a `ui` task layer and component / e2e-through-UI test tiers.

**Negative**
- A larger feature: two layers of tasks and tests, and a contract both sides must keep in step.

**Neutral**
- The web surface reuses the existing components and tokens; it does not introduce a second styling system. Its rendering choice is recorded inline in sad.md §4 (client-rendered `/game/**`), below the ADR gate.

## Links

- PRD: [[../PRD.md]] §1, §4, §6.1
- SAD: [[../sad.md]] §4, §5
- Related ADR: [[0002-socket-io-for-realtime-channel]]
