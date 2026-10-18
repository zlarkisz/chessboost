---
paths: ["apps/server/**"]
---

# Server architecture

## Dependency rule

Feature-first by bounded context, light Clean inside each BC (see
`docs/adr/0001-initial-setup.md`). Allowed directions:

- `domain` → nothing outside its own `domain/` (no `@nestjs/*`, no Drizzle, no
  npm packages, no Node built-ins, no `shared/`).
- `application` → `domain` (own BC) and `shared/events`.
- `infrastructure` → `domain`, `application`, `shared/`, `src/infrastructure/`;
  implements ports declared in `domain`.
- `presentation` → `application` (and `domain` types for DTO mapping).
- Between BCs — only via `shared/events`. `game/**` never imports `boost/**` and
  vice versa.

`make arch` must pass before any commit that touches `apps/server/src`.

## Prohibitions

- No decorators and no `@nestjs/*` imports in `domain/` — plain classes and types.
- Ports (e.g. `BoostRepository`) are abstract classes in `domain/`, used as DI
  tokens. Bind implementations from `infrastructure/` only in `<bc>.module.ts`.
- Controllers and the WebSocket gateway live only in `presentation/`.
- No direct imports between BCs; no shared mutable state between them.
- Do not weaken or disable rules in `.dependency-cruiser.cjs` to make a check pass.
