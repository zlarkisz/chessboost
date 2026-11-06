---
feature: new-game
status: Done
owner: frontend engineer (zlarkisz)
updated_at: 2026-11-06
moved_from: docs/features/new-game/design-spec.md
---

# Design spec: New game screen

## 1. Raw request

> Screen: "New game" on `/` (apps/web/app/pages/index.vue) — replaces the current placeholder.
> Goal: player picks time control (e.g. 3+2, 5+0, 10+0), color (white/black/random) and boost mode, then starts a game.
> Keep: link to /game/demo; dark theme and tokens from ADR 0002 / tailwind.css; existing shadcn-vue components (Button, Card).
> States: default, loading (creating game), success (navigate to game), error (could not create), disabled (Start until time control picked).
> Layouts: desktop 1440, mobile 390.
> Design tool next: Figma, file https://www.figma.com/design/I1umCR1bMGZAflAwq8BBU1 (pages 01 Current UI / 02 Components / 03 New screen).
> No backend yet — game creation is mocked; do not add a UI library.

## 2. Why now

- **Problem:** `/` is a placeholder (wordmark + one demo link); a player has no way to express how they want to play.
- **User:** a player arriving at chessboost who wants to start a game.
- **Trigger:** the game screen demo shipped (PR #10, commit `6978a5d`); the entry screen is the next missing surface.
- **Success outcome:** a player picks a time control and colour, presses Start, sees feedback, and lands on the game screen — or sees a recoverable error.

## 3. Evidence sources

No `PRD.md` or `idea-brief.md` exists for `new-game` — this is a bounded UI iteration driven by the raw request.

| Status | Source | What it proves |
|---|---|---|
| Observed | `apps/web/app/pages/index.vue` | Current `/`: `<h1>` "chessboost", `Button variant="secondary" size="lg" as-child` → `NuxtLink to="/game/demo"` "Open the demo game"; `useHead({ title: 'chessboost' })`. |
| Observed | `apps/web/app/pages/game/demo.vue` | Only game route; renders hard-coded `GameView` via `GameScreen`. No `/game/[id]` route exists. |
| Observed | `apps/web/app/assets/css/tailwind.css` | Token layers: graphite palette → role tokens (`--background`, `--card`, `--primary`, `--muted-foreground`, `--destructive`, `--ring`, …), boost tokens (`--boost-*`), Archivo font with `wdth` axis. |
| Observed | `apps/web/nuxt.config.ts` | `htmlAttrs.class: 'dark'` — dark theme is the default; shadcn components live in `@/components/ui`. |
| Observed | `apps/web/app/components/ui/` | Available: `button`, `card` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`), `alert-dialog`, `tooltip`. No radio/toggle group. |
| Observed | `apps/web/app/components/ui/button/index.ts` | Button variants `default/outline/secondary/ghost/destructive/link`, sizes incl. `lg` (h-9); `disabled:opacity-50 disabled:pointer-events-none`; focus ring `focus-visible:ring-3 ring-ring/50`. |
| Observed | `apps/web/package.json` | Deps include `reka-ui`, `@lucide/vue`, `@vueuse/core`; scripts only `dev`, `build`. No web lint/test/typecheck script; `vue-tsc` is a devDependency. |
| Observed | `apps/web/app/lib/game-format.ts`, `app/types/game.ts` | Boost copy/icons per `BoostType` (`invulnerability`, `extra-move`, `teleport`) and tone classes — reusable for the boost info block. |
| Observed | `.claude/rules/web-design.md` | Taste rules: graphite surfaces, calm UI, no outline-only buttons on dark, no amber accent, colours only via tokens, contrast text ≥ 4.5:1 / icons ≥ 3:1, both themes must work, propose 3–4 treatments before changing real visuals. |
| Observed | `SPEC.md` | Boost every 7th half-move, fixed set of 3 types; "Configurable / user-defined boost types" and matchmaking are non-goals. |
| Observed | `docs/adr/0002-shadcn-vue-for-web-ui.md` | UI components are copied into the app (owned code), not a library in `node_modules`. |
| Confirmed | User raw request (§1) | Fields, states, layouts, Figma target, mocked creation, no new UI library. |
| Confirmed | User answer 2026-11-05 | Success navigates to `/game/demo`; no new game route. |
| Confirmed | User answer 2026-11-05 | Boost mode is informational only ("on") — no switch. |
| Confirmed | User answer 2026-11-05 | Single-choice controls use shadcn-vue **RadioGroup**, copied into `components/ui/radio-group` (not a new library; built on existing `reka-ui`). |
| Confirmed | User answer 2026-11-05 | Mock: ~800 ms delay then success; `?mock=fail` on `/` makes creation fail. |
| Proposed | This spec | Layout, defaults, copy and loading/error presentation — see §14. |

## 4. Current user flow

1. **Start:** `/` shows the centered wordmark "chessboost" and one secondary button.
2. **Action:** user clicks "Open the demo game".
3. **System response:** client-side navigation via `NuxtLink`; no loading or async work.
4. **Success:** `/game/demo` renders the demo `GameScreen`.
5. **Recovery:** N/A — no failure path exists.

## 5. Target user flow

1. **Start:** `/` shows the "New game" card: time control (none selected), colour (Random selected), boost info, a disabled **Start game** button, and the demo link.
2. **Action:** user picks a time control (3+2, 5+0 or 10+0), optionally changes colour, and presses **Start game**.
3. **System response:** loading state — the button shows a spinner and "Creating game…", all controls are disabled; the mock resolves after ~800 ms.
4. **Success:** client navigates to `/game/demo`.
5. **Recovery:** with `?mock=fail` the mock rejects; an inline error appears under the button, controls re-enable, selections are kept, and pressing **Start game** again retries.

## 6. Requirements

| ID | Status | Requirement | Source |
|---|---|---|---|
| BR-01 | Confirmed | `/` (rendered by `apps/web/app/pages/index.vue`) shows the New game screen in place of the current placeholder. | Raw request |
| BR-02 | Confirmed | The player chooses exactly one time control from 3+2, 5+0, 10+0 (minutes + increment seconds). No time control is preselected. | Raw request |
| BR-03 | Confirmed | The player chooses exactly one colour from White, Black, Random. | Raw request |
| BR-04 | Confirmed | Boost mode is shown as information, not a control: boosts are on; a boost spawns after every 7th half-move; the three boost types are listed with their existing icon and name. | User answer; `SPEC.md`; `app/lib/game-format.ts` |
| BR-05 | Confirmed | **Start game** is disabled (not clickable, `disabled` attribute) until a time control is selected. | Raw request |
| BR-06 | Confirmed | Pressing **Start game** enters a loading state: spinner + "Creating game…" on the button, button and all radio groups disabled, duplicate submits impossible. | Raw request |
| BR-07 | Confirmed | On mock success the app navigates to `/game/demo`. | User answer |
| BR-08 | Confirmed | On mock failure an inline error is shown, controls re-enable, selections are preserved, and Start can be pressed again to retry. The error renders in a fixed-height error slot reserved under the Start button in every state (empty in Empty/Ready/Loading), so showing or clearing it causes no layout shift. Inline only — no toast (the error is bound to the Start action and the user retries on the same screen). | Raw request; user answer; owner review 2026-11-05 |
| BR-09 | Confirmed | Game creation is a client-side mock: resolves after ~800 ms; rejects when the page URL has `?mock=fail`. No HTTP/WebSocket call, no server change. | Raw request; user answer |
| BR-10 | Confirmed | The link to `/game/demo` remains on the screen and works in every state except loading. | Raw request; `index.vue` |
| BR-11 | Confirmed / Observed | Visuals use only existing role tokens from `tailwind.css` (no raw colours) and render correctly in the default dark theme and in light theme. | Raw request; ADR 0002; `web-design.md` |
| BR-12 | Confirmed | Reuse `Button` and `Card*` from `components/ui`; add only shadcn-vue `RadioGroup` (copied into `components/ui/radio-group`). No new npm UI library. | Raw request; user answer; ADR 0002 |
| BR-13 | Confirmed | Layout works at 1440 px desktop and 390 px mobile with no horizontal scroll and the Start button reachable without hidden content. | Raw request |
| BR-14 | Observed / Proposed | Accessible: each radio group has a visible label wired as its accessible name; arrow keys move within a group; Tab order is time control → colour → Start → demo link; focus ring visible; error announced via `role="alert"`; loading announced (`aria-busy` / live text). | `web-design.md` contrast rule; Button focus styles |
| BR-15 | Confirmed | Out of scope stays untouched: `apps/server`, `pages/game/demo.vue`, `GameScreen` and other `components/game/*`, token values in `tailwind.css`, `package.json` dependencies (except what the shadcn-vue CLI adds for RadioGroup — expected: none, `reka-ui` already present). | Raw request; `SPEC.md` non-goals |
| BR-16 | Observed | Page title stays `chessboost` (`useHead`). | `index.vue` |

## 7. Routes and frames

| Surface | Route / frame | Required content and layout |
|---|---|---|
| Current | `/` | Centered wordmark "chessboost" (text-4xl semibold) + secondary lg button "Open the demo game". Capture on Figma page **01 Current UI** as `Current / Home / Desktop 1440` and `Current / Home / Mobile 390`. |
| Desktop | `1440 × 900` — `New game / Desktop / <State>` on page **03 New screen** | Proposed: page background `--background`; wordmark above a single centered `Card` (max-width ~28 rem). Card: `CardHeader` (title "New game", description), `CardContent` (Time control group, Colour group, Boost info), `CardFooter` (full-width **Start game** `default` lg button + inline error slot). Demo link (`Button variant="link"` or `ghost`) below the card. |
| Mobile | `390 × 844` — `New game / Mobile / <State>` on page **03 New screen** | Same order, single column; card spans width minus 16 px gutters; radio options of one group stay in one row (3 options fit at 390); Start button full-width. |
| Components | page **02 Components** | `RadioGroup` option card (unchecked / checked / hover / focus / disabled), `Button` (default lg: enabled / disabled / loading), Boost info row, Inline error. |

## 8. State inventory

| State | Trigger | Visible result | Recovery / next action |
|---|---|---|---|
| Empty / Disabled | First load of `/` | No time control selected; Colour = Random; **Start game** disabled (opacity 50 %, not clickable). | Select a time control. |
| Ready | A time control selected | Selected option shows checked styling; **Start game** enabled. | Press **Start game**. |
| Loading | Start pressed | Button: spinner (`@lucide/vue` loader icon) + "Creating game…"; both radio groups and the demo link disabled; card `aria-busy="true"`. | Wait ~800 ms. |
| Success | Mock resolves | Navigation to `/game/demo` (no separate success screen). | — |
| Error | Mock rejects (`/?mock=fail`) | Inline error in the reserved error slot under the button (fixed height 20 px, present but empty in all other states) in `--destructive`: "Couldn't create the game. Try again."; controls re-enabled; selections kept; no layout shift — wordmark, card and Start keep their position. No toast. | Press **Start game** to retry (error clears on retry; slot stays). |
| Hover | Pointer over option / button | Option: subtle `--muted`/`--accent` surface; button: existing variant hover. | — |
| Focus | Keyboard focus | Visible `ring-ring/50` ring (existing Button/RadioGroup focus style). | — |
| Disabled option | Loading | Radio items `disabled`, reduced opacity. | Ends with success or error. |

## 9. Reuse and handoff contract

| Design responsibility | Current code owner / token | Decision |
|---|---|---|
| Page route and orchestration | `apps/web/app/pages/index.vue` | extend (replace placeholder template) |
| Card container | `@/components/ui/card` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) | reuse |
| Start button, demo link | `@/components/ui/button` (`default` lg; `link`/`ghost` for demo) | reuse |
| Single-choice option groups | `@/components/ui/radio-group` (shadcn-vue `RadioGroup`, `RadioGroupItem`) | new — copied via shadcn-vue CLI |
| Option tile styling (e.g. "3+2 / Blitz") | — | new component candidate (thin wrapper around `RadioGroupItem` + `<label>`) |
| Boost info list (icon + name) | `apps/web/app/lib/game-format.ts` `boostCopy`, tone classes; tokens `--boost-*-ui` | reuse |
| Spinner icon | `@lucide/vue` (existing dependency) | reuse |
| Mock game creation | — | new component candidate (composable under `app/composables/`) |
| Colours, radius, font | `tailwind.css` role tokens: `background`, `card`, `foreground`, `muted-foreground`, `primary`, `destructive`, `ring`, `border`, `--radius`; `--font-sans` (Archivo) | reuse, no new tokens |

## 10. Responsive and accessibility contract

- **Responsive:** single column at all widths; content centered with max-width ~28 rem; ≥16 px side gutters on mobile; no horizontal scroll at 390 px; Start and demo link visible without scrolling at 1440×900 and reachable by scroll at 390×844.
- **Keyboard:** Tab: Time control group → Colour group → Start game → demo link. Inside a group, arrow keys move selection (roving focus from `reka-ui`). Enter/Space on Start submits. Disabled Start is skipped or announced as disabled.
- **Semantics:** one `<h1>` (wordmark or "New game" — pick one in design); each group has `role="radiogroup"` with an accessible name ("Time control", "Colour"); option labels read e.g. "3 + 2, Blitz"; error in `role="alert"`; loading text in the button is read by screen readers.
- **Contrast and motion:** text ≥ 4.5:1, boost icons and selected-state indicators ≥ 3:1 in both themes (per `web-design.md`); spinner respects `prefers-reduced-motion` (static icon or no spin).

## 11. Content and realistic data

- Wordmark: `chessboost`
- Card title: `New game` · description (Proposed): `Pick a clock and a side. Boosts are always on.`
- Time control label: `Time control` · options: `3 + 2` (Blitz), `5 + 0` (Blitz), `10 + 0` (Rapid)
- Colour label: `Colour` · options: `White`, `Black`, `Random` (default)
- Boost info (Proposed copy): `Boosts on — a boost appears after every 7th half-move.` + items `Invulnerability`, `Extra move`, `Teleport` with their existing icons (names from `boostCopy`).
- Primary button: `Start game` · loading: `Creating game…`
- Error: `Couldn't create the game. Try again.`
- Demo link: `Open the demo game`

## 12. Non-goals and forbidden changes

- No backend, API, WebSocket or DB work; no change in `apps/server`.
- No new route (`/game/[id]` is out of scope); `pages/game/demo.vue` and `components/game/*` unchanged.
- No boost-mode switch, no configurable boost frequency or types (SPEC non-goal).
- No matchmaking, opponent selection, ratings, accounts (SPEC non-goals).
- No new npm UI library; no change to token values or palette in `tailwind.css`; no raw colour values in components.
- Selected settings are not passed to or used by the game screen in this iteration.
- Approved out-of-list change (2026-11-06): a `@layer base` rule in `tailwind.css` restores `cursor: pointer` on enabled buttons (Tailwind v4 default is `cursor: default`); not a token change, BR-15 holds.
- No theme switching (e.g. neon / arcana / minimal) — later: needs an ADR and a role-token set per theme; Figma Starter allows 1 variable mode per collection.

## 13. Design references

- Current UI evidence: route `/` (`apps/web/app/pages/index.vue`) — capture into Figma page **01 Current UI**.
- Figma file: https://www.figma.com/design/I1umCR1bMGZAflAwq8BBU1 — pages **01 Current UI**, **02 Components**, **03 New screen**.
- Current UI frames (page 01, reconstructed from `index.vue`, not a live capture): `Current / Home / Desktop 1440` node `9:4`, `Current / Home / Mobile 390` node `9:9`.
- Variables: `chessboost/primitives` (hidden, 14 vars) and `chessboost/roles` (mode `Dark`, 25 vars, `codeSyntax.WEB = var(--<token>)`); read-back matched `tailwind.css` (23/23 at check time; `secondary`, `secondary-foreground` added afterwards for the page 01 button).
- Components (page 02): `Option tile` `14:51` (Checked × State, 8), `Button` `14:72` (default: Default/Focus/Disabled/Loading; link: Default/Hover/Focus/Disabled), `Boost info row` `15:19` (3 types), `Inline error` `15:20`; review frame `Review / Components` `15:26`. Added vars: `input`, `accent`, `accent-foreground`, `radius-md`, `radius-xl` (`chessboost/roles` = 30 vars).
- Layout options (page 03, section `23:488` "Layout options — later"): B — card beside static board `23:82` (board component `Static board` `21:92` on page 02, vars `board-light`, `board-dark`, `board-frame`). C removed.
- Approved frames (page 03, section `25:383` "New game — A (approved)"): Desktop 1440×900 — Empty `25:384`, Ready `23:4`, Loading `25:467`, Error `25:581`; Mobile 390×844 — Empty `25:726`, Ready `25:664`, Loading `25:809`, Error `25:923`. All built from component instances; clipping/overlap/collapse check: 0 issues.
- **Approved node links (Copy link to selection) — implement against these:**
  - Desktop Ready: https://www.figma.com/design/I1umCR1bMGZAflAwq8BBU1/chessboost-%E2%80%94-New-game?node-id=23-4
  - Mobile Ready: https://www.figma.com/design/I1umCR1bMGZAflAwq8BBU1/chessboost-%E2%80%94-New-game?node-id=25-664
  - Other states: node IDs above (same structure, only component variants differ).
- Design system map (tokens, components, rules): `docs/design/design-system.md`.
- Live evidence for this screen: `docs/design/first-screen/`.
- Repo-local design file: N/A — Figma is the design tool.

## 14. Open decisions

| Decision | Why it matters | Owner | Due | Status |
|---|---|---|---|---|
| Layout: single centered card vs. card beside a decorative static board vs. two columns (settings + boost info) | Board-as-hero is the house direction (`web-design.md`), but a board here adds scope; per taste rules show treatments before choosing. | Owner (zlarkisz) | 2026-11-05 | Confirmed — A (single centered card). B kept on page 03 as "later (board/pieces style undecided)"; C removed |
| Mobile option-tile padding 10 px / gap 8 px (desktop 12 / 10) | At 390 px three tiles are 103 px wide; with desktop padding "Random" overflows its text box. | Owner | 2026-11-05 | Confirmed — 10 / 8 on mobile, 12 / 10 on desktop |
| Default colour = Random | Affects Empty state frame and whether colour needs a choice. | Owner | 2026-11-05 | Confirmed — Random |
| Time-control option content: show category (Blitz/Rapid) under the numbers | Extra copy and tile height; helps newcomers. | Owner | 2026-11-05 | Confirmed — shown under the numbers, small, `muted-foreground` |
| Exact copy for description, boost info and error (§11) | Content in specimens. | Owner | 2026-11-05 | Confirmed — as in §11 |
| Demo link visual: `link` vs `ghost` button | `web-design.md` rejects outline-only buttons on dark; both remaining variants are allowed. | Owner | 2026-11-05 | Confirmed — `link` variant |
| Web deterministic gate: `pnpm --filter @chessboost/web build` + `pnpm --filter @chessboost/web exec nuxt typecheck` | No web make target / script exists; needed for DOD-10. Adding a `make` target is a separate change. | Owner | 2026-11-05 | Confirmed |
| Figma variables: Dark only | Figma plan allows 1 mode per collection (`addMode: Limited to 1 modes only`); light theme cannot be designed with variables. | Owner | 2026-11-05 | Confirmed — `chessboost/roles` has a single `Dark` mode; light theme is verified only in the browser (DOD-09) |

## 15. Spec-ready gate

- [x] Current product behavior is backed by repository evidence.
- [x] Product decisions are confirmed or visibly marked Proposed.
- [x] Requirements have stable IDs.
- [x] Desktop/mobile, states, reuse, accessibility, and non-goals are covered.
- [x] No route, dependency, component, token, or API has been invented as fact.
- [x] Every requirement maps to a DOD row in section 16 below.

---

# Definition of Done

Completion means every applicable row is checked with evidence. An agent report, generated image,
or visual impression is not evidence by itself.

## 16. Done checks

| ID | Covers | Layer | Pass condition | Evidence | Done |
|---|---|---|---|---|---|
| DOD-01 | BR-01, BR-15 | Specification | Scope, sources, non-goals and all §14 decisions are approved or resolved before implementation. | Review of sections 1–14; §14 statuses updated | [x] §14: all 8 decisions Confirmed (2026-11-05); no `Proposed` left in §6 |
| DOD-02 | BR-01, BR-12, BR-13 | Design structure | Figma page 03 has frames `New game / Desktop / {Empty, Ready, Loading, Error}` (1440×900) and `New game / Mobile / {Empty, Ready, Loading, Error}` (390×844), built with auto layout; option tile, button and error are components on page 02. | Figma node inspection (`get_metadata` on page 03 and 02) | [x] Figma `get_metadata` on section `25:383` (2026-11-06): 8 frames `New game / {Desktop 1440×900, Mobile 390×844} / {Empty, Ready, Loading, Error}`, all from component instances (`Option tile`, `Button`, `Boost info row`, `Inline error (role=alert)`) |
| DOD-03 | BR-11, BR-12 | Tokens and reuse | Figma fills map to existing role tokens; code uses `Card*`, `Button`, and `components/ui/radio-group` only; `git grep -nE "oklch\(\|#[0-9a-fA-F]{3,6}\b\|rgb\(" apps/web/app/pages/index.vue apps/web/app/components` returns no new raw colours outside `tailwind.css`. | Figma variables + grep output + diff | [x] `git grep` → 0 matches, exit 1 (2026-11-06); `raw-color-guard` hook now blocks new ones; Figma read-back 0 unbound colours (lesson 9 audit) |
| DOD-04 | BR-05, BR-06, BR-08 | States | Empty/Disabled, Ready, Loading, Error frames exist in Figma; in the browser Start has `disabled` on load, becomes enabled after selecting a time control, and is `disabled` with text "Creating game…" during loading. | Figma frames + browser DOM checks | [x] PASS — `docs/design/first-screen/verify-ui-2026-11-06.md` (and 2026-11-05 re-run); Figma frames per DOD-02 |
| DOD-05 | BR-02, BR-03, BR-04, BR-07, BR-09, BR-10, BR-16 | Behavior | Live run: open `/` → title is `chessboost`; exactly 3 time options and 3 colour options, Random checked; boost info lists 3 types; select `5 + 0` → Start → after ≤ 1.5 s URL is `/game/demo`; back on `/`, demo link navigates to `/game/demo`. No network request is fired by Start (Network panel). | `verify-ui` scenario + network log | [x] PASS — `docs/design/first-screen/verify-ui-2026-11-06.md`: `/game/demo` in 848 ms, 0 fetch/XHR |
| DOD-06 | BR-08, BR-09 | Behavior (error) | Open `/?mock=fail` → select `3 + 2`, colour `Black` → Start → error text "Couldn't create the game. Try again." visible in `role="alert"`; `3 + 2` and `Black` still checked; Start enabled; pressing Start again shows loading again. No layout shift: `getBoundingClientRect().top` of the Start button and of the card are equal before Start is pressed and after the error appears (at 1440×900 and 390×844). | `verify-ui` scenario + screenshot + `getBoundingClientRect()` values before/after | [x] PASS — `docs/design/first-screen/verify-ui-2026-11-06.md`: alert text, selection kept, tops equal at 1440 and 390 |
| DOD-07 | BR-13 | Responsive | At 1440×900 and 390×844: `document.documentElement.scrollWidth <= innerWidth`; Start button and demo link in DOM and reachable; screenshots of Empty and Error in both widths. | Viewport screenshots + DOM check | [x] PASS — `docs/design/first-screen/verify-ui-2026-11-06.md`: `scrollWidth` = `innerWidth` at both widths |
| DOD-08 | BR-14 | Accessibility | Keyboard-only run reaches time group → colour group → Start → demo link in order; arrow keys change selection within a group; focus ring visible on each stop; both radiogroups have accessible names; error has `role="alert"`; contrast of text ≥ 4.5:1 and icons/selected indicators ≥ 3:1 in dark and light. | Keyboard run + accessibility tree snapshot + contrast measurements | [x] PASS — `docs/design/first-screen/verify-ui-2026-11-06.md`: keyboard log + contrast table (dark/light) |
| DOD-09 | BR-11 | Theme | Screenshots of Ready state with `.dark` (default) and with `.dark` removed (light) show no unreadable text or invisible controls. | Two screenshots + contrast check | [x] PASS — `docs/design/first-screen/verify-ui-2026-11-06.md`: ready dark/light screenshots |
| DOD-10 | BR-12, BR-15 | Deterministic gates | `pnpm --filter @chessboost/web build` and `pnpm --filter @chessboost/web exec nuxt typecheck` exit 0 (or the approved replacement from §14). | Command output | [x] `nuxt typecheck` exit 0, `build` exit 0 (2026-11-06, `main` @ `d70b507`) |
| DOD-11 | BR-12, BR-15 | Scope | `git diff --stat main...` touches only `apps/web/app/pages/index.vue`, `apps/web/app/components/ui/radio-group/**`, new files under `apps/web/app/composables/` or `apps/web/app/components/` for this screen, and `docs/features/new-game/**` (moved to `docs/design/` on 2026-11-06); `package.json` / lockfile unchanged or changes justified. | `git diff --stat` + targeted diff review | [x] `git show --stat 2055f37`: listed files + 3 approved extras — `tailwind.css` cursor base rule and `web-design.md` line (§12), `.gitignore` `.playwright-cli/`; `package.json` / lockfile unchanged |
| DOD-12 | BR-01–BR-16 | Live evidence | Every DoD row above has PASS/FAIL with expected vs actual. | `verify-ui` report + screenshots | [x] `docs/design/first-screen/verify-ui-2026-11-06.md` (6/6 PASS); rows 01–03, 10, 11 carry their own evidence |

## 17. Requirement coverage

| Requirement | Covered by DoD IDs | Gap |
|---|---|---|
| BR-01 | DOD-01, DOD-02, DOD-12 | none |
| BR-02 | DOD-05, DOD-12 | none |
| BR-03 | DOD-05, DOD-06, DOD-12 | none |
| BR-04 | DOD-05, DOD-12 | none |
| BR-05 | DOD-04, DOD-12 | none |
| BR-06 | DOD-04, DOD-12 | none |
| BR-07 | DOD-05, DOD-12 | none |
| BR-08 | DOD-04, DOD-06, DOD-12 | none |
| BR-09 | DOD-05, DOD-06, DOD-12 | none |
| BR-10 | DOD-05, DOD-12 | none |
| BR-11 | DOD-03, DOD-09, DOD-12 | none |
| BR-12 | DOD-02, DOD-03, DOD-10, DOD-11, DOD-12 | none |
| BR-13 | DOD-02, DOD-07, DOD-12 | none |
| BR-14 | DOD-08, DOD-12 | none |
| BR-15 | DOD-01, DOD-10, DOD-11, DOD-12 | none |
| BR-16 | DOD-05, DOD-12 | none |

## 18. Final gate

- [x] Every requirement is covered by at least one DoD row.
- [x] Every applicable DoD row is checked and links to evidence.
- [x] Every `Proposed` decision (section 14) was approved or removed before implementation.
- [x] Deterministic checks and live browser verification both passed.
- [x] The final repository diff matches the approved scope.
