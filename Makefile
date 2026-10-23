.PHONY: dev test db-generate migrate arch typecheck test-hooks

dev:
	docker compose up -d --wait postgres
	pnpm -r --parallel dev

test:
	pnpm -r test

db-generate:
	pnpm --filter @chessboost/server db:generate

migrate:
	pnpm --filter @chessboost/server db:migrate

arch:
	pnpm --filter @chessboost/server arch

typecheck:
	pnpm --filter @chessboost/server typecheck

test-hooks:
	node .claude/hooks/tests/run.mjs
