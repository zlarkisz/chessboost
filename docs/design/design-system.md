# chessboost design system

Entry point for the web UI's design system. It maps where each part lives; it does not copy
values. Colour values exist in exactly one place — `apps/web/app/assets/css/tailwind.css`.

| Part | Source of truth |
|---|---|
| Token values (palette, roles, light/dark) | `apps/web/app/assets/css/tailwind.css` |
| Token model and component ownership | `docs/adr/0002-shadcn-vue-for-web-ui.md` |
| Visual taste: likes, rejected treatments, how to change visuals | `.claude/rules/web-design.md` |
| Design file and Figma variables | Figma `chessboost — New game` (`I1umCR1bMGZAflAwq8BBU1`), collections `chessboost/primitives`, `chessboost/roles` |
| Enforcement | `raw-color-guard` hook in `chessboost-toolkit` ≥ 1.2.0 |
| First screen | `docs/design/design-spec.md` + `docs/design/first-screen/` |

## 1. Token layers

```
palette (raw oklch)  →  roles (:root = light, .dark = dark)  →  @theme inline  →  utilities
--graphite-900          --primary: var(--graphite-900)          --color-primary     bg-primary
```

1. **Palette** — `:root` block "Palette". Named scales: `graphite-*` (cool slate, hue 255),
   `bone-100`, `wood-*`, `cyan-*`, `lemon-300`, `red-*`, and the boost family
   `blue-* / green-* / magenta-*` in shades `360` (deep), `560` (mid), `680` (glow).
   Referenced **only** by role layers — never by components.
2. **Roles** — `:root` (light) and `.dark` (dark, default via `htmlAttrs.class: 'dark'`).
   Every role is a `var(--palette-…)` or a `color-mix` of one.
3. **`@theme inline`** — exposes each role as `--color-<role>` so Tailwind generates
   `bg-<role>`, `text-<role>`, `border-<role>`, `ring-<role>` …
4. **Components** — use role utilities only. Opacity modifiers on roles (`bg-accent/50`,
   `text-foreground/65`, `ring-ring/50`) are allowed; raw `#hex` / `oklch()` / `rgb()` / `hsl()`
   in `.vue` are blocked by `raw-color-guard`.

## 2. Roles

### Base (shadcn model, paired `X` / `X-foreground`)

| Role | Used for |
|---|---|
| `background` / `foreground` | page surface and default text |
| `card` / `card-foreground` | `Card` surfaces |
| `popover` / `popover-foreground` | tooltips, dialogs |
| `primary` / `primary-foreground` | main action (`Button` default), checked radio, links |
| `secondary` / `secondary-foreground` | tonal buttons ("Offer draw") |
| `muted` / `muted-foreground` | quiet surfaces; secondary text, captions |
| `accent` / `accent-foreground` | hover and selected surfaces (checked `OptionTile`) |
| `destructive` | resign, errors (inline error on New game) |
| `border`, `input`, `ring` | dividers, field/tile borders, focus ring and selected border |
| `chart-1…5`, `sidebar-*` | shadcn defaults, not used by current screens |

### Chess and boosts (project-specific)

| Role | Used for | Used in |
|---|---|---|
| `board-light`, `board-dark`, `board-frame` | wooden squares and frame; coordinates text | `GameBoard` |
| `highlight` | last-move highlight (translucent lemon) | `GameBoard` |
| `boost-invuln`, `boost-extra`, `boost-teleport` | boost icon on the board (`-560`) | `GameBoard`, `lib/game-format.ts` |
| `boost-*-glow`, `boost-invuln-deep`, `boost-halo` | glow under affected piece, 1 px icon outline | `boost-glow`, `boost-outline` utilities |
| `boost-*-ui` | boost text, icons and move-list marks outside the board (deep in light, glow in dark) | `BoostStatus`, `MoveList`, New game boost info |
| `counter-filled`, `counter-empty` | half-move counter to the next boost | `BoostCounter` |
| `clock`, `clock-foreground`, `clock-active`, `clock-active-foreground`, `clock-low` | player clocks: idle, running, low time | `PlayerClock` |

### Other tokens

- **Radius:** `--radius` = 0.5 rem → `rounded-sm…4xl` are multiples of it (`rounded-lg` = `--radius`).
- **Font:** Archivo (variable `wdth`): condensed width for clocks, normal for the interface.
- **Motion:** `animate-boost-appear`, `animate-boost-fade-in` (300 ms).

## 3. Components

| Layer | Components | Rule |
|---|---|---|
| `components/ui/` (shadcn-vue, owned code — ADR 0002) | `Button` (variants `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; sizes `xs…lg`, `icon*`), `Card*`, `RadioGroup` / `RadioGroupItem`, `AlertDialog*`, `Tooltip*` | Add new ones with the shadcn-vue CLI; adjust through props/classes at the call site before editing the copy |
| `components/game/` | `GameScreen`, `GameBoard`, `PlayerClock`, `MoveList`, `BoostCounter`, `BoostStatus`, `GameActions` | Game screen (`/game/demo`) |
| `components/new-game/` | `OptionTile` — labelled tile around `RadioGroupItem` (label + optional sublabel; checked = `accent` surface + `ring` border) | First screen (`/`) |
| `lib/game-format.ts` | `boostCopy` — name, icon, `grants` text and `tone` classes (`icon`, `shadow`, `glow`, `ui`, `mark`, `count`) per boost type | Single source for boost copy and colours; `BoostStatus`, `MoveList` and New game read it |

## 4. Rules

- Colours only through roles; a new colour need = a new **role** (and palette entry if needed)
  in `tailwind.css`, documented in this file — ask the owner first.
- Both themes must work; dark is the default.
- Contrast: text ≥ 4.5:1, icons and meaningful graphics ≥ 3:1, in dark **and** light.
- Boost colours stay one family (similar lightness/saturation) and avoid wood/amber and red.
- Visual changes: show 3–4 treatments side by side before changing the real screen
  (`.claude/rules/web-design.md` → "How to work on visuals").

## 5. Code ↔ Figma

- Figma variables mirror roles: `chessboost/roles` aliases `chessboost/primitives`,
  `codeSyntax.WEB = var(--<role>)`. Read-back matched `tailwind.css` at the time of the New game work.
- Figma Starter limits a collection to one mode → Figma has **Dark only**; the light theme is
  verified in the browser.
- When code and Figma disagree, code wins and Figma is updated (e.g. checked radio styling).

## 6. Known debt

- Unchecked `OptionTile` border `input` on `card` is 1.5:1 (< 3:1, WCAG 1.4.11). Accepted on
  2026-11-05; fixing it needs a change to `--input` in both themes.
- `chart-*` and `sidebar-*` roles come from the shadcn template and are unused.
