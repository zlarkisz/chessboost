.PHONY: dev test db-generate migrate arch test-hooks

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

test-hooks:
	node .claude/hooks/tests/run.mjs
