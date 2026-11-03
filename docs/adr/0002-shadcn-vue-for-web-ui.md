# ADR 0002 — shadcn-vue instead of Nuxt UI in apps/web

- Status: accepted
- Date: 2026-11-04

## Context

- `apps/web` is planned as Nuxt 4 + Nuxt UI; ADR 0001 fixes Nuxt as the client stack.
- We want the shadcn token model: paired variables (`--primary` / `--primary-foreground`)
  in OKLCH, a `.dark` class for the dark theme, and `@theme inline` in Tailwind v4.
- We want UI components to live in our own code, not as a library in `node_modules`.
- The learning material follows the official shadcn skill and MCP server, which target React.

## Decision

Replace Nuxt UI with shadcn-vue in `apps/web`, integrated through the `shadcn-nuxt`
module. Components are copied into the app's source and owned by us; theming uses
shadcn-style OKLCH token pairs, `.dark`, and `@theme inline` in Tailwind v4.
The shadcn-vue MCP server is available for component lookup.

## Alternatives considered

- **Keep Nuxt UI.** Rejected: it defines tokens its own way, not the shadcn model, and
  components stay a library in `node_modules` rather than code we own.
- **Switch to React + shadcn.** Rejected: would match the lesson 1:1 with the official
  skill and MCP server, but changes the frontend stack fixed in ADR 0001.

## Consequences

- Same token model as shadcn, so shadcn theming material applies directly while staying on Nuxt.
- Component code is in the repo: we can change it freely, but we also maintain it and
  pull upstream fixes manually.
- shadcn-vue is an unofficial community port (v2.9.0, ~10.8k stars at decision time):
  it may lag behind React shadcn or diverge from the official skill/MCP examples.
- Project docs that named Nuxt UI (`CLAUDE.md`, `ARCHITECTURE.md`, `README.md`, `SPEC.md`)
  are updated together with this ADR.
