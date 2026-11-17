---
id: T1
title: "Bootstrap the NestJS server with Jest so make test, make arch and make typecheck pass"
layer: "wiring"
deps: []
acs: []
files_hint: ["apps/server/package.json", "apps/server/src/main.ts", "apps/server/src/app.module.ts", "apps/server/jest.config.ts", "apps/server/tsconfig.json", "apps/server/test/"]
owner: "Gleb Bufin"
estimate: "M"
status: "todo"
---

# T1 — Bootstrap the NestJS server with Jest so make test, make arch and make typecheck pass

## Why

The backend is an empty skeleton (`main.ts` is empty, there is no Jest config, and `@nestjs/cli` is not declared). [sad §11](../sad.md) names this as the first task, and [architecture-map](../../../architecture-map.md) §Constraints lists the same gap.

**ACs:** none (enabling task) · **Blocked by:** — · **Estimate:** M

## What

- Add the dev dependencies the existing scripts already call: `@nestjs/cli`, `@nestjs/testing`, `jest`, `ts-jest`, `@types/jest`. Check that the pins `pnpm@12.16.1` / TypeScript ^6.0 install.
- `jest.config.ts` (ts-jest, roots `src` + `test`).
- `main.ts`: `NestFactory.create(AppModule)`, listen on the port from env (variable name in `.env.example`).
- One smoke test: `AppModule` compiles in a `Test.createTestingModule`.
- No feature code.

**Files:** `apps/server/package.json`, `apps/server/src/main.ts`, `apps/server/src/app.module.ts`, `apps/server/jest.config.ts`, `apps/server/tsconfig.json`, `apps/server/test/`

## Definition of Done

- [ ] `make test` is green with at least one test.
- [ ] `make arch` and `make typecheck` are green.
- [ ] `pnpm --filter @chessboost/server dev` starts and logs that it is listening.
- [ ] lint + typecheck clean

## Notes

- Read only `.env.example` for variable names. Never read or edit `.env` (CLAUDE.md security).
- Every later server task builds on this one.
