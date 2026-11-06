# First screen — New game (`/`)

The entry screen of chessboost: the player picks a time control and a colour, sees that boosts are
on, and starts a game (mocked; success opens `/game/demo`, `/?mock=fail` shows the error state).

| What | Where |
|---|---|
| Spec + Definition of Done | [`../design-spec.md`](../design-spec.md) (16 BR, 12 DoD, all checked) |
| Design system it uses | [`../design-system.md`](../design-system.md) |
| Figma | `I1umCR1bMGZAflAwq8BBU1`, page 03, section `25:383` — Desktop Ready `23:4`, Mobile Ready `25:664` |
| Code | `apps/web/app/pages/index.vue`, `components/new-game/OptionTile.vue`, `components/ui/radio-group/`, `composables/useCreateGame.ts` |
| Latest live check | [`verify-ui-2026-11-06.md`](verify-ui-2026-11-06.md) — PASS 6/6 |
| History | [`verify-ui-2026-11-05.md`](verify-ui-2026-11-05.md) — first run 4/6, re-run 6/6 |

Screenshots prefixed `2026-11-06-` belong to the latest run; unprefixed ones to 2026-11-05.
