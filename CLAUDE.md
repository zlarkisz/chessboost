# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project status

`chessboost` is at the scaffolding stage: there is no application code, package
manifest, build, lint, or test setup yet. Do not assume a framework or stack —
ask, or follow whatever the user introduces. Update this file (commands,
architecture, conventions) once real code lands.

## Repository layout

- `.claude/settings.json` — shared Claude Code settings (permissions, sandbox, env).
- `.devcontainer/` — dev container for running Claude Code in isolation:
  - `Dockerfile` — `node:24` base, installs `@anthropic-ai/claude-code` globally
    plus firewall tooling (`iptables`, `ipset`, `dig`, `jq`, `aggregate`).
  - `devcontainer.json` — runs as `node`, adds `NET_ADMIN`/`NET_RAW`, persists
    `~/.claude` in a named volume, runs the firewall script on start.
  - `init-firewall.sh` — default-deny egress; allows only GitHub (from
    `api.github.com/meta`), Anthropic/Claude domains, and `registry.npmjs.org`.
- `.gitignore` — ignores `.env*` (except `.env.example`), `.claude/settings.local.json`,
  `node_modules/`, `.DS_Store`.

## Security constraints (do not weaken without being asked)

- Never read or edit `.env`, `.env.*`, `*.pem`, `*.key`, or `~/.ssh/**` — these are
  denied in `.claude/settings.json` and the sandbox config.
- `rm -rf` and `git push --force` are denied; don't try to work around them.
- Inside the dev container, outbound network is restricted. If a new dependency
  source (another registry, API, CDN) is needed, add its domain to
  `ALLOWED_DOMAINS` in `.devcontainer/init-firewall.sh` rather than disabling
  the firewall.
- Keep secrets out of the repo; document required variables in `.env.example`.
- Personal overrides go in `.claude/settings.local.json` (gitignored), not in the
  shared `settings.json`.

## Conventions

- Commit messages use Conventional Commits (`chore: ...`, `feat: ...`, `fix: ...`),
  short imperative subject.
- Node 24 is the runtime available in the dev container.
