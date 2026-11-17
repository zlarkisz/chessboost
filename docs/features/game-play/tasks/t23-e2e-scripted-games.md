---
id: T23
title: "Run end-to-end scripted games through two browser sessions against the real server and database"
layer: "tests"
deps: ["T17", "T20", "T21", "T22"]
acs: ["AC-01", "AC-08", "AC-17", "AC-22", "AC-27", "AC-27b", "AC-28", "AC-29", "AC-29b", "AC-31", "AC-32"]
files_hint: ["apps/web/e2e/", "apps/server/test/e2e/"]
owner: "Gleb Bufin"
estimate: "L"
status: "todo"
---

# T23 — Run end-to-end scripted games through two browser sessions against the real server and database

## Why

QG-1 and QG-3 need cross-component checks ([sad §10](../sad.md)), along with the scripted games behind [PRD §7](../PRD.md).

**ACs:** AC-01, AC-08, AC-17, AC-22, AC-27, AC-27b, AC-28, AC-29, AC-29b, AC-31, AC-32 ([PRD §5](../PRD.md)) · **Blocked by:** T17, T20, T21, T22 · **Estimate:** L

## What

- Two isolated browser sessions against the real server and PostgreSQL. The runner is chosen by plan-tests.
- Scenarios:
  - a full game to mate;
  - both sessions closed until the deadline, then check in the database that game-end time minus the deadline is ≤ 1 s;
  - a server restart mid-game;
  - a drop right after a half-move, then reconnect;
  - two tabs of one player;
  - a rematch accepted, both sessions land on one new game with swapped colours;
  - a game nobody started is aborted after the 20 s window, only New game offered.

**Files:** `apps/web/e2e/`, `apps/server/test/e2e/`

## Definition of Done

- [ ] The e2e suite is green locally on `make dev`.
- [ ] Each listed AC has one named scenario.
- [ ] The timeout scenario asserts a lateness of ≤ 1 s.
- [ ] lint + typecheck clean

## Notes

- Latency emulation (150 ms RTT) belongs to the scripted games, not to this suite ([sad §10](../sad.md)).
