# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

`chessboost` — online chess with boosts. After every 7th half-move (each side's move
counts separately) a boost spawns on a free square (random type from a fixed set:
invulnerability for 1 move, extra move, teleport); the piece that lands on it gets
the effect immediately.
See `SPEC.md` for scope and `ARCHITECTURE.md` for structure.

Status: skeleton only — folders, empty Nest modules, manifests without
dependencies. Nothing is installed yet.

## Stack

- pnpm workspaces monorepo (`apps/*`), Node 24.
- `apps/web` — Nuxt 4 + Nuxt UI.
- `apps/server` — NestJS, TypeScript, WebSocket via `@nestjs/websockets`.
- PostgreSQL (`docker-compose.yml`) + Drizzle ORM / drizzle-kit.
- Jest for server tests; dependency-cruiser for architecture checks.

## Commands

Run `pnpm install` once first. Always use make targets (see `Makefile`): `make dev`,
`make test`, `make db-generate`, `make migrate`, `make arch` — don't call drizzle-kit,
depcruise, jest or docker compose directly. Copy `.env.example` → `.env` before `make dev`.

## Repository layout

- `apps/server/src/<bc>/` — one folder per bounded context, each with a `README.md`.
  Scaffolded (`game`, `boost`): `domain/`, `application/`, `infrastructure/`,
  `presentation/` and `<bc>.module.ts`. Planned (`auth`, `player`, `match`,
  `billing`, `notifications`): README only. Map: `docs/bc-map.md`.
- `apps/server/src/shared/events/` — integration event contracts (`MoveMade`,
  `BoostSquareSpawned`, `BoostApplied`), the only link between BCs.
- `apps/server/src/infrastructure/db/` — shared Drizzle connection, `schema/`,
  `migrations/`.
- `apps/server/.dependency-cruiser.cjs` — enforced architecture rules.
- `apps/web/app/` — Nuxt app (`pages/`, `components/`, `composables/`).
- `docs/adr/` — architecture decision records.
- `.claude/settings.json` — shared Claude Code settings (permissions, sandbox, env).
- `.devcontainer/` — dev container for running Claude Code in isolation.

## Architecture

@ARCHITECTURE.md

`presentation → application → domain ← infrastructure`; `domain` imports nothing
external (no `@nestjs/*`, no npm, no `shared/`). Bounded contexts talk only via
`shared/events` — never import each other. Enforced by `make arch`.
Details and Nest-specific prohibitions: `.claude/rules/server-architecture.md`;
per-context boundaries: `.claude/rules/<bc>.md`; BC map: `docs/bc-map.md`.

## Where guidance goes

- Repo-wide mistake → one line here (keep this file under ~120 lines).
- Only for some paths → `.claude/rules/<topic>.md` with `paths:`.
- Repeated multi-step procedure → propose a skill.
- Must never be violated → propose a check (depcruise / test / hook), not prose.
- Architecture decision with alternatives → new ADR in `docs/adr/`.

## Security constraints (do not weaken without being asked)

- Never read or edit `.env`, `.env.local`, `.env.*.local`, `.env.development`,
  `.env.production`, `.env.staging`, `.env.test`, `*.pem`, `*.key`, or `~/.ssh/**` —
  denied by `permissions.deny` in `.claude/settings.json` (also enforced for Bash in
  the sandbox). `.env.example` is allowed — it holds variable names only.
- `rm -rf` and `git push --force` are denied; don't try to work around them.
- Inside the dev container, outbound network is restricted. If a new dependency
  source (another registry, API, CDN) is needed, add its domain to
  `ALLOWED_DOMAINS` in `.devcontainer/init-firewall.sh` rather than disabling
  the firewall.
- Keep secrets out of the repo.
- Personal overrides go in `.claude/settings.local.json` (gitignored), not in the
  shared `settings.json`.

## Conventions

- Commit messages use Conventional Commits (`chore: ...`, `feat: ...`, `fix: ...`),
  short imperative subject.
- Node 24 is the runtime available in the dev container.
