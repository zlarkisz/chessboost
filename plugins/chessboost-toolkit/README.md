# chessboost-toolkit

## Purpose

Claude Code tooling for the chessboost monorepo: scaffold planned bounded contexts
from the `game`/`boost` template and keep every `<bc>/domain/` framework-free.

## Install

Local development (no install, current session only):

```sh
claude --plugin-dir ./plugins/chessboost-toolkit
```

Marketplace install — coming in the next iteration (`--scope project`).

## Commands

| Command | What it does |
|---|---|
| `/chessboost-toolkit:scaffold-context <bc>` | Scaffolds a `planned` context in `apps/server/src/<bc>/`: empty Nest module, 4 layer folders, `.claude/rules/<bc>.md`, status updates in docs. Runs `make typecheck` + `make arch`, asks before committing. Manual only (`disable-model-invocation`). |

## Skills

—

## Hooks

| Event | Matcher | Script | Effect |
|---|---|---|---|
| `PreToolUse` | `Edit\|Write` | `hooks/domain-import-guard.mjs` | Blocks (exit 2) writes to `apps/server/src/<bc>/domain/**` that import npm packages, `@nestjs/*`, `shared/` or another context. |

Isolated tests: `node hooks/tests/run.mjs` (6 fixtures, `block-*` → 2, `pass-*` → 0).
