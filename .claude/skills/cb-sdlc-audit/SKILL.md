---
name: cb-sdlc-audit
description: >-
  Inspect a chessboost feature's SDLC artifacts (CONTEXT, idea-brief, PRD, SAD, ADRs,
  data model, OpenAPI, api-sync report, tasks) and report which are present, missing,
  N/A, misplaced or stale against the code. Read-only: never creates or edits files and
  does not check content consistency. Use when asked to audit SDLC docs for a feature,
  check which artifacts are missing, "перевір документи по SDLC", or /cb-sdlc-audit <slug>.
argument-hint: <feature-slug>
allowed-tools: Read, Grep, Glob, Bash(git log *)
---

# cb-sdlc-audit — SDLC artifact audit for one feature

Checks one chessboost feature against the nine SDLC artifacts listed below and reports,
per artifact, whether it is present, partial, missing, N/A, misplaced or stale — then
gives 3–5 recommendations for the most critical gaps.

**Diagnosis only.** Never create, edit, move or delete a file, and never offer to fill
a gap during the audit. Do not judge whether documents agree with each other (that is
`api-sync-report` / `sdlc:critic` territory). For every gap, name the skill that
produces the artifact and stop — the owner decides what to do next.

## Artifacts and where to look

`<slug>` = the argument (e.g. `new-game`). Check the primary path first, then the fallbacks.

| # | Artifact | Primary path | Fallbacks (partial / project level) | Produced by |
|---|---|---|---|---|
| 1 | CONTEXT | `docs/features/<slug>/CONTEXT.md`, `CONTEXT.md` | `docs/bc-map.md` (terms without definitions), domain paragraph in `CLAUDE.md` | `/sdlc:fix-term` |
| 2 | idea-brief | `docs/features/<slug>/idea-brief.md` | design spec §"Why now" (problem, success outcome) | `/sdlc:interview <slug>` |
| 3 | PRD | `docs/features/<slug>/PRD.md` | design spec: requirements `BR-*`, user flows, states | `/sdlc:write-prd <slug>` |
| 4 | SAD | `docs/features/<slug>/sad.md` | project level only: `docs/adr/0001-*`, `docs/bc-map.md` | `/sdlc:architecture-design <slug>` |
| 5 | ADRs | `docs/features/<slug>/adr/` | `docs/adr/*.md` that name the feature or govern its layer | `/sdlc:decide-adr` |
| 6 | data model | `docs/features/<slug>/data-model.md` | `apps/server/src/infrastructure/db/schema/` | `/sdlc:generate-data-model <slug>` |
| 7 | OpenAPI | `docs/features/<slug>/contracts/openapi.yaml` | `apps/server/src/shared/events/`; request types in `apps/web/app/composables/` (implicit contract) | `/sdlc:api-forge <slug>` |
| 8 | api-sync report | `docs/features/<slug>/contracts/api-sync-report.md` | — | `/sdlc:api-forge <slug>` |
| 9 | tasks | `docs/features/<slug>/tasks/` (`tasks.json`) | — | `/sdlc:break-tasks <slug>` |

Design spec = `docs/features/<slug>/design-spec.md` or `docs/design/design-spec.md`.
A file whose body says it has moved ("Moved", a link elsewhere) is a stub, not the artifact.

Also report the design spec as an extra row **10** (outside the nine): present / misplaced
(lives outside the feature folder, or the feature folder holds a stub) / missing.

## Status rules

Give each artifact exactly one status:

| Status | When |
|---|---|
| **present** | the file exists at the primary path and is not a stub |
| **partial** | no primary file, but part of its content exists in a fallback |
| **missing** | nothing at the primary path or in any fallback |
| **N/A** | the feature does not need it **and** the reason can be checked (e.g. empty DB schema, no endpoint). No checkable reason → **missing** |
| **misplaced** | the artifact exists but outside the feature folder, or the primary path holds a stub |
| **stale** | present, but the feature code changed after the artifact's last commit |

### Special cases

- **SAD is never N/A.** A small feature still needs a short SAD (all sections walked,
  non-applicable ones marked N/A inside it). No SAD → **missing**, or **partial** if only
  project-level architecture exists.
- **A project-level ADR that governs the feature's layer counts as present** for ADRs,
  when the feature's own decisions are small and reversible. Recommend `/sdlc:decide-adr`
  only for an open decision that is irreversible, crosses modules, or has real alternatives.

### Stale check

1. Find the feature's code files, first source that answers wins:
   1. `files` hints in `docs/features/<slug>/tasks/*.md`;
   2. the scope / handoff list in the design spec;
   3. commits mentioning the slug: `git log -i --grep=<slug> --name-only`, and again with
      hyphens replaced by spaces (`new-game` → `new game`).
2. Compare `git log -1 --format=%cs -- <artifact>` with `git log -1 --format=%cs -- <code files>`.
   Code newer → **stale**.
3. No source found → write "stale check: not possible — no code file list" instead of guessing.

## Protocol

1. **Argument.** No slug → list `docs/features/*/` and ask which feature. Never guess.
2. **Scan.** For each of the nine artifacts (and the design spec row) check the primary path, then the fallbacks.
   Record where it was found (path, section) or what was searched.
3. **Status.** Apply the status rules, including the stale check.
4. **Report** in the format below.
5. **Stop.** Do not offer to create or fix anything.

## Report format

    <slug> · sdlc-audit · <YYYY-MM-DD>

    | # | Artifact | Status | Evidence (where / why) | Next |
    |---|---|---|---|---|
    | 1 | CONTEXT | partial | `docs/bc-map.md` — terms without definitions | `/sdlc:fix-term` |
    ...

    Recommendations (most critical first):
    1. …

- **Next** = the "Produced by" skill for missing / partial / stale; a fix hint for misplaced;
  `—` for present and N/A.
- 3–5 recommendations. Order by chain position first — an earlier gap blocks everything
  after it: CONTEXT / idea-brief → PRD → SAD / ADRs → data model / OpenAPI / api-sync →
  tasks. Within the same position: missing → partial → stale → misplaced. N/A and present
  are never listed. Say what each gap blocks downstream.
- Things outside the repo (PR descriptions, chats, trackers) are not scanned — if a gap
  suggests the content lives there, say so in one recommendation.
