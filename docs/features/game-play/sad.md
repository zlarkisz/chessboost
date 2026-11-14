---
status: Draft
owner: "Gleb Bufin"
reviewers: []
updated_at: "2026-11-14"
feature_size: M
stage: "04-05"
ticket: ""
target_surfaces: [backend-service, web-frontend]  # filled in §4 — subset of: backend-service | web-frontend | mobile-app | desktop-app | cli | worker | library-sdk. Read (never re-derived) by api-forge/complete-sequence-diagrams/break-tasks/plan-tests/review-feature → _shared/surfaces.md
---

# Software Architecture Document — game-play

<!-- Stages 04-05 → see sdlc/plugin/skills/architecture-design/SKILL.md -->
<!-- 12 Arc42 sections. Empty sections — <!-- N/A: <one-line reason> -->. -->
<!-- C4 Context (L1) lives inline in §3. C4 Container (L2) lives inline in §5. -->
<!-- §6 Runtime view seeds the primary flow(s) here; complete-sequence-diagrams (stage 06) then -->
<!--    fills §6 with every critical flow / §5 AC — no cap. -->
<!-- Numbers in §10 come VERBATIM from PRD §6 NFR — no inventing, no rounding. -->

## 1. Introduction and goals

<!-- 🎯 Навіщо: стабільна памʼять про «що + три головні якості + хто зацікавлений».     -->
<!--           Через рік ніхто не згадає на словах, ЯКІ ТРИ ЯКОСТІ для системи критичні. -->
<!-- 📋 Що писати: 1 абзац intent + 3 рядки топ-3 якості + таблиця stakeholders.        -->
<!-- 📌 Приклад: «QG-1: швидкість редагування блоку p95 ≤500 мс»                         -->

**Intent.** game-play turns chessboost from a static demo into real two-player online chess: two paired players play legal chess under a running clock; every game reaches exactly one correct game end (Mate, Resign, Timeout, Draw) or is aborted; a disconnected player returns to the same game; and the pair can go straight into a rematch. It is the foundation the boosts feature runs on. First users: the author and 1–2 friends playing 10 scripted games (PRD §1).

**Top-3 quality goals (1-liners; full scenarios in §10):**

1. **Single authoritative outcome** — every game reaches exactly one game end or abort, identical on both screens, even when one or both players are offline (PRD §2 Goal 1; AC-08, AC-10, AC-16, AC-23).
2. **Real-time sync** — half-move delivery to the opponent ≤ 500 ms p95; clocks on both screens agree within ≤ 0.5 s (PRD §6).
3. **Recoverability** — a reconnect or a server restart resumes the real position and clocks (shown ≤ 3 s after reopening); a clock that runs out ends the game ≤ 1 s later, also when both players are offline (PRD §6; AC-27, AC-29b).

**Stakeholders.**

| Role | Interest | Sign-off owner? |
|---|---|---|
| player | plays games; needs the same result and reason on both screens | No |
| Gleb Bufin (author — Architect / Tech Lead) | builds the feature, approves the SAD | Yes |
| match context | produces the pairing a game is created from | No |
| boost context (future feature) | consumes every half-move with position + half-move number | No |
| player context / rating (future feature) | consumes each game end exactly once | No |

<!-- Decision overrides (¶4) — populated by the Step-7 critic resolution loop, empty otherwise.       -->
<!-- Each: «Decision override: <headline> — rationale: <reason>» so downstream skills see the choice.  -->

## 2. Constraints

<!-- 🎯 Навіщо: §4 (стратегія) працює тільки коли §2 зафіксувала, ЩО ВЖЕ ЗАФІКСОВАНО:    -->
<!--           стек, версії, дедлайн, регуляторні вимоги. Це вхід, не вихід.             -->
<!-- 📋 Що писати: чотири блоки — Технічні / Організаційні / Конвенції / Регуляторні.     -->
<!-- 📌 Приклад: «Postgres 18» (не «Postgres»); «дедлайн Q3 — жорсткий» (не «бажано»).    -->

**Technical.**
- Runtime Node 24; pnpm workspaces monorepo (`apps/*`), `pnpm@12.16.1`.
- Server: NestJS ^12.2, TypeScript ^6.0; real-time via `@nestjs/websockets` (stack fixed in `CLAUDE.md`; not installed yet).
- Web: Nuxt ^4.6, Vue ^3.5, shadcn-vue ^2.9 (`docs/adr/0002-shadcn-vue-for-web-ui.md`), Tailwind ^4.3; game-screen components already exist in `apps/web/app/components/game/` (static demo data only).
- Data: PostgreSQL 17 (`postgres:17-alpine`, `docker-compose.yml`) + Drizzle ORM / drizzle-kit (not installed yet). No Redis, no message broker.
- Architecture: feature-first bounded contexts + light Clean (`docs/adr/0001-initial-setup.md`); `presentation → application → domain ← infrastructure`; contexts talk only via `shared/events`; enforced by `apps/server/.dependency-cruiser.cjs` (`make arch`). `domain` imports no npm package, so any chess library sits behind a port.
- Tests: Jest (not installed yet; no config).

**Organisational.**
- One developer (the author) working with agents.
- No hard deadline in the PRD. Gate: ≥ 9/10 scripted games reach a correct game end before boosts reach circle 2 (PRD §7). The clock spike runs first; a scope cut is decided at the end of implementation week 1 (PRD §8).
- Prerequisite features are not built: registration / sign-in and «how players meet» (pairing). game-play consumes their outputs through ports.

**Conventions.**
- `CLAUDE.md`, `.claude/rules/server-architecture.md`, `.claude/rules/game.md`, `.claude/rules/web-design.md`.
- Only make targets (`make dev|test|arch|db-generate|migrate`); Conventional Commits.
- UI tokens and components from `docs/design/design-system.md`.

**Regulatory / external.**
- No regulated data — classification «internal» (PRD §6.1).
- Mandatory controls (PRD §6.1): per-game player authorization; time and game end decided only by the server; non-player and non-existent games look the same.
- Security review required — first authorization boundary and first real-time channel between players.

## 3. Context and scope

<!-- 🎯 Навіщо: малює КОРДОН СИСТЕМИ — хто з нею говорить ззовні, де закінчується зона довіри. -->
<!--           Без §3 §5 і §8 (авторизація) розпливаються — неясно, що «всередині», а що «зовні». -->
<!-- 📋 Що писати: 2-3 речення бізнес-контексту + таблиця зовнішніх систем + Mermaid C4Context. -->
<!-- 📌 Приклад: «зовнішні — нема (свідома відмова від third-party у v1)» — це теж рішення.   -->
<!-- Кордон довіри (trust boundary) — лінія, за якою ти не довіряєш даним без перевірки.       -->

game-play lets two paired players play one live game of chess in the browser: the server alone decides legality, time and the game end, and both screens mirror it. It starts where the match context's pairing ends and hands each half-move and each game end to the contexts that build on it (boost, player/rating). Trust boundary: everything a player's browser sends is a request to be validated — never a fact (PRD §6.1).

<!-- brownfield: server side is greenfield — game/boost/match contexts are empty scaffolds; web has static game-screen components (apps/web/app/components/game/) -->

**External systems (in / out):**

| Actor or system | Type | Interaction |
|---|---|---|
| player (White / Black) | Person | Makes half-moves, resigns, offers / answers draws and rematches, reconnects — over a real-time channel from the browser |
| Sign-in (auth context, planned feature) | System (internal, other context) | Tells game-play who the signed-in person is; game-play then checks they are one of the game's two players |
| match context | System (internal, other context) | Produces the pairing (two players, time control, colours) a game is created from — `MatchCreated` |
| boost context (future feature) | System (internal, other context) | Consumes `MoveMade` (position + half-move number) |
| player context / rating (future feature) | System (internal, other context) | Consumes `GameEnded` once per game end; aborted games are not published as a game end |

**C4 Context (L1):**

```mermaid
C4Context
    title game-play — System Context

    Person(white, "player (White)", "Makes half-moves, resigns, offers draws and rematches")
    Person(black, "player (Black)", "The opponent, same capabilities")

    System(gameplay, "chessboost game-play", "Server-authoritative live chess: board, clocks, game end, reconnect, rematch")
    System_Ext(auth, "Sign-in (auth context, planned)", "Identifies the signed-in person")
    System_Ext(match, "match context", "Pairs two players with a time control and colours")
    System_Ext(boost, "boost context (future)", "Counts half-moves and spawns boosts")
    System_Ext(rating, "player context / rating (future)", "Records game results for rating")

    Rel(white, gameplay, "Plays the game", "real-time channel over HTTPS")
    Rel(black, gameplay, "Plays the game", "real-time channel over HTTPS")
    Rel(gameplay, auth, "Resolves the signed-in person", "in-process port")
    Rel(match, gameplay, "MatchCreated", "integration event")
    Rel(gameplay, boost, "MoveMade", "integration event")
    Rel(gameplay, rating, "GameEnded", "integration event")
```

## 4. Solution strategy

<!-- 🎯 Навіщо: 3-4 СТРАТЕГІЧНІ СТОВПИ, з яких потім ростуть усі ADR. Без §4 кожен ADR    -->
<!--           виглядає випадковим — нема зонтика. ⭐ Найгустіша секція — тут ADR-gate    -->
<!--           спрацьовує майже завжди (рішення незворотні + мульти-модульні).            -->
<!-- 📋 Що писати: спершу Target surface(s), потім 3-4 стратегічні вибори.                -->
<!--           На кожен — заголовок + 2-3 речення rationale.                              -->
<!-- 📌 ПЕРШЕ рішення §4 — Target surface(s): ЩО САМЕ будуємо. Записується у frontmatter   -->
<!--           target_surfaces: [...] і гейтить §5 (один контейнер на поверхню) + усі       -->
<!--           наступні стадії. Деривиться з PRD §1 «для кого» + §4 ролей. → _shared/surfaces.md -->
<!-- 📌 Приклад: «Зберігати урок як таблицю блоків» — стовп, з якого виросло ADR-0001.    -->

**Target surface(s) (the first decision — what's being built):** `[backend-service, web-frontend]` — game-play ADR-0001 ([adr/0001-build-backend-service-and-web-frontend.md](adr/0001-build-backend-service-and-web-frontend.md)). The backend owns the real-time contract and the state; the existing Nuxt app consumes it.

**Given, not decided here — the server is authoritative** (PRD §6.1): a browser sends only intents («move e2→e4», «resign», «offer draw»); legality, time and the game end are decided by the server, and clients render the server's state. Every choice below follows from this.

**UI-architecture (web-frontend) — inline, no ADR** (gate 1/3: rework < 3 days, web module only). The game route `/game/**` is client-rendered inside the existing Nuxt app (`routeRules: { '/game/**': { ssr: false } }`); the rest of the site keeps its rendering. One composable `useGame(id)` owns the live game state, fed by the real-time channel; the existing `GameScreen` / `GameBoard` / `PlayerClock` / `GameActions` components and the design-system tokens are reused. Until the first server snapshot arrives the page shows a skeleton — an empty board without pieces and inactive clocks, never a guessed position. Rationale: the state only exists live, so server-side HTML would be stale on arrival and would need a second (HTTP) channel.

**Top strategic choices (the seeds for ADRs):**

1. **Socket.IO as the real-time channel** — game-play ADR-0002 ([adr/0002-socket-io-for-realtime-channel.md](adr/0002-socket-io-for-realtime-channel.md)). Rooms per game (every tab of both players), acks per action, a heartbeat tuned for the offline marker ≤ 10 s, and automatic reconnection serve QG-2 and QG-3. Actions are sent only while connected, each with an ack and a timeout; after a reconnect the client takes a full snapshot instead of relying on the client's emit buffer (AC-27b).
2. **Persist each action before broadcast, one queue per game** — game-play ADR-0003 ([adr/0003-persist-each-action-before-broadcast-with-per-game-queue.md](adr/0003-persist-each-action-before-broadcast-with-per-game-queue.md)). PostgreSQL is the source of truth: each accepted action is one transaction (game row with a version + an append-only half-move log), broadcast only after commit. Actions of one game — including timeout and abort checks — are processed strictly one at a time; the version column is a database-level backstop; a client `commandId` makes retries and second tabs idempotent. Serves QG-1 and QG-3.
3. **Deadline clock, one timer per game, re-armed on boot** — game-play ADR-0004 ([adr/0004-deadline-clock-with-per-game-timer-rearmed-on-boot.md](adr/0004-deadline-clock-with-per-game-timer-rearmed-on-boot.md)). The server stores remaining times and the moment the current turn began (before a side's first half-move: the abort deadline). A per-game timer fires at the deadline and enqueues a time check; on boot all active games are loaded and their timers re-armed; a safety sweep every 5 s catches any overdue active game. Clients receive remaining times and count down with a monotonic timer from receipt. Serves QG-1 and QG-3; validated first by the clock spike (PRD §8).
4. **chess.js behind a `ChessRules` port** — game-play ADR-0005 ([adr/0005-chess-js-behind-chess-rules-port.md](adr/0005-chess-js-behind-chess-rules-port.md)). Move legality comes from a pinned chess.js in `game/infrastructure`; the domain keeps game-end precedence, insufficient material per AC-18, «can this side mate by material» (AC-09), clocks and offers.
5. **In-process event bus, published after commit** — game-play ADR-0006 ([adr/0006-in-process-event-bus-published-after-commit.md](adr/0006-in-process-event-bus-published-after-commit.md)). game publishes `GameStarted`, `MoveMade`, `GameEnded` and the new `GameNotStarted { matchId, reason }` (pairing refused, AC-22b) through `shared/events` after the transaction commits, and consumes `MatchCreated`. Handlers are isolated: a consumer's failure never reaches the player's action.

Each tactical decision in later sections should be traceable to one of these strategic seeds. Tactical decisions that *contradict* a strategic choice are red flags — surface them in §11 Risks.

## 5. Building block view

<!-- 🎯 Навіщо: ВНУТРІШНЯ ДЕКОМПОЗИЦІЯ — модулі, контейнери, БД. Статична топологія:   -->
<!--           хто з ким може говорити. Без §5 §6 (сценарії) не має словника учасників. -->
<!-- 📋 Що писати: 1 абзац про стиль (шари/гексагональна/clean/на подіях) +            -->
<!--           дерево папок + Mermaid C4Container.                                       -->
<!-- 📌 ОДИН Container на кожну оголошену target_surface (frontmatter): fullstack        -->
<!--           [backend-service, web-frontend] = backend-API container + web/SPA container; -->
<!--           [backend-service, mobile-app] = API + mobile app. Container(web, …) нижче — -->
<!--           лише приклад однієї поверхні; додай/заміни під оголошене у §4. → _shared/surfaces.md -->
<!-- 📌 Приклад: «web-app, content-api, media-worker, postgres, s3, cdn».                -->

<One paragraph: layered / hexagonal / clean / event-driven. Why.>

**Internal decomposition:**

```
<e.g. internal/modules/goals/>
├── domain/       <entities + sentinel errors>
├── app/          <use cases / services>
├── infra/        <repository + outbox impl>
├── ports/        <HTTP handlers, DTOs, error mapping>
└── module.go     <self-wiring>
```

**C4 Container (L2):**

```mermaid
C4Container
    title <system> — Containers

    Person(user, "<User>")

    Container_Boundary(boundary, "<Our System>") {
        Container(web, "<Web/API container>", "<technology>", "<purpose>")
        Container(svc, "<Service container>", "<technology>", "<purpose>")
        ContainerDb(db, "<DB>", "<technology>", "<purpose>")
    }

    System_Ext(ext, "<External>", "<purpose>")

    Rel(user, web, "<interaction>", "<protocol>")
    Rel(web, svc, "<service calls>")
    Rel(svc, db, "<reads/writes>", "<driver>")
    Rel(svc, ext, "<emits>", "<protocol>")
```

## 6. Runtime view

<!-- 🎯 Навіщо: ПОТІК У RUNTIME для 1-2 критичних сценаріїв. Хто з ким коли і у якому     -->
<!--           порядку говорить. Без §6 §5 — лише купа коробок без життя.                  -->
<!-- 📋 Що писати: Mermaid sequenceDiagram. Учасники — імена з §5 (не вигадуй нові!).      -->
<!--           Повідомлення семантичні («складає чорновик»), БЕЗ HTTP-методів/шляхів —     -->
<!--           ендпоінт-рівневі sequence-діаграми зʼявляться у stage 06 (api-forge).        -->
<!-- ⏳ RESERVED FOR SEQUENCES: architecture-design сіє лише primary flow(s) тут.          -->
<!--           complete-sequence-diagrams (stage 06) ДОПОВНЮЄ §6 кожним критичним flow /    -->
<!--           кожним §5 AC — без обмеження. Не намагайся покрити все тут.                  -->
<!-- 📌 Приклад: «methodist → web-app: складає чорновик → web-app → content-api: зберегти». -->

**Critical flow 1: <flow name>**

```mermaid
sequenceDiagram
    actor User
    participant API
    participant Service
    participant DB
    User->>API: <request>
    API->>Service: <call>
    Service->>DB: <write tx>
    DB-->>Service: ok
    Service-->>API: result
    API-->>User: 201
```

<!-- For XS/S: 1 flow above is enough. For M+: add 2-4 more (e.g. failure-mode flow, async flow). -->

**Critical flow 2: <e.g. async event propagation>** — <if applicable, otherwise N/A>.

## 7. Deployment view

<!-- 🎯 Навіщо: ТОПОЛОГІЯ, яку DevOps має знати без читання Helm-чартів — скільки реплік,  -->
<!--           де живе фоновий обробник, ПРИ ЯКИХ ЧИСЛАХ масштабуємось.                     -->
<!-- 📋 Що писати: 2-3 речення про топологію + метрики + алерти + конкретні числа-пороги.   -->
<!-- 📌 Приклад: «500 IC → партиціонування за кварталом» (не «при зростанні подумаємо»).    -->
<!-- 🎯 Можна N/A для XS/S функцій, що переюзають існуюче розгортання без змін.            -->

<Topology in 2-3 sentences. Where it runs (k8s / VM / serverless), replicas, scaling thresholds.>

**Monitoring:**
- <Metrics — e.g. Prometheus `<metric_name>`>
- <Alerts — e.g. "outbox lag > 10 min → page on-call">
- <Tracing — e.g. OpenTelemetry HTTP spans>

**Scaling thresholds:**
- <e.g. 500 IC × 5 goals × 26 checkpoints/Q = 65k rows/year — comfortable in one table>
- <e.g. partitioning by quarter at >500k rows/year>

<!-- For XS/S that doesn't change deployment: <!-- N/A: feature reuses existing deployment unit -->. -->

## 8. Crosscutting concepts

<!-- 🎯 Навіщо: НАСКРІЗНІ ПАТЕРНИ, які перетинають кілька модулів: логування, помилки,    -->
<!--           авторизація, ID strategy, outbox, кеш. ⭐ Друга найгустіша секція.          -->
<!--           Якщо патерн всередині одного модуля — він НЕ сюди. Якщо це конвенція        -->
<!--           проєкту в цілому — у CLAUDE.md.                                              -->
<!-- 📋 Що писати: таблиця концепт / конвенція / де визначено. Один рядок на концепт.      -->
<!-- 📌 Приклад: «UUID v7 (час+випадковий, сортується) у app-layer» — як default з CLAUDE.md. -->

| Concept | Convention | Where defined |
|---|---|---|
| Logging | <e.g. structured slog, fields `module=<name>`> | <CLAUDE.md §X or here> |
| Authentication | <e.g. JWT via session middleware> | <CLAUDE.md §X> |
| Error handling | <e.g. domain sentinel → ports/errors.go → apperr JSON> | <CLAUDE.md §X> |
| ID strategy | <e.g. UUID v7 in app layer> | <CLAUDE.md §X> |
| Internationalisation | <e.g. N/A, English only> | — |
| Observability | <e.g. OpenTelemetry on HTTP boundaries> | — |
| Outbox / events | <module-specific patterns, if any> | <here> |

## 9. Architecture decisions

<!-- 🎯 Навіщо: ЗВОРОТНИЙ ІНДЕКС на папку adr/. `ls adr/` дає файли, §9 дає семантику —    -->
<!--           чому вони існують, до якого зрізу SAD привʼязані, у якому статусі.           -->
<!-- 📋 Що писати: таблиця з 4 колонками. Один рядок на ADR. Mixed status — це OK.         -->
<!-- 📌 Приклад: «0001 | Зберігати урок як таблицю блоків | Accepted | §4».                -->

| # | Title | Status | Section |
|---|---|---|---|
| <NNNN> | <imperative — e.g. "Use sliding window for rate limiting"> | Accepted | §<N> |
| <NNNN> | <imperative — e.g. "Co-locate outbox worker in API process"> | Accepted | §<N> |

ADR files live under `docs/features/<slug>/adr/NNNN-<title>.md`.

## 10. Quality requirements

<!-- 🎯 Навіщо: ДЕРЕВО ЯКОСТЕЙ (Quality Tree) — беремо мету з §1 і розкладаємо на          -->
<!--           конкретні листя: тести, метрики, конфіги, drill-и. ⭐ Без §10 §1 — це       -->
<!--           маніфест. З §10 кожна декларація мапиться на щось, ЩО МОЖНА ДОВЕСТИ.        -->
<!-- 📋 Що писати: на кожну якість з §1 — When / Then / How verify. Числа з PRD §6 NFR     -->
<!--           ДОСЛІВНО (не округлюй p95 ≤250мс до ≤300мс — це F6-помилка критика).        -->
<!-- 📌 Приклад: «p95 ≤500 мс на UPDATE блоку, перевіримо k6 load test 100 req/s».        -->

Each top-3 goal from §1 expanded into a full scenario:

**QG-1. <quality attribute>**
- **When:** <trigger condition>
- **Then:** <expected behavior with numbers from PRD NFR>
- **How verify:** <test / chaos drill / load test / observability>

**QG-2. <quality attribute>**
- **When:** <trigger>
- **Then:** <expected>
- **How verify:** <how>

**QG-3. <quality attribute>**
- **When:** <trigger>
- **Then:** <expected>
- **How verify:** <how>

## 11. Risks and technical debt

<!-- 🎯 Навіщо: ⭐ збирає ВСЕ, що може зламатись — і не лише технічне. Без §11 ризики   -->
<!--           обговорюються на стендапах і губляться; борг лишається у голові того,    -->
<!--           хто його прийняв.                                                          -->
<!-- 📋 Що писати: таблиця ризик/борг — серйозність — мітигація — власник. Технічний    -->
<!--           борг окремою секцією.                                                      -->
<!-- 📌 Приклад: «EM не пушить — member не оновлює дані | High | …». Перший ризик —      -->
<!--           часто продуктовий, не технічний. Це нормально.                            -->

<!-- Severity column literals: Low / Medium / High for regular risks; "Open question" for rows
     created by Step-7 `Save as Open Question` resolutions (see references/socratic-loop.md). -->

| Risk / debt | Severity | Mitigation | Owner |
|---|---|---|---|
| <e.g. Outbox lag may reach hours during downstream outage> | Medium | <Alert >10 min, on-call playbook, retry backoff> | <DevOps> |
| <e.g. No event schema versioning in v1> | Medium | <ADR-NNNN planned for v2, graceful handling of unknown fields> | <Backend> |
| Open architectural decision: <decision-headline> | Open question | Resolve before <stage trigger or YYYY-MM-DD>; <inline rationale from Step-7 Save-as-OQ> | <owner> |

**Accepted debt (acceptable in v1, plan to fix later):**
- <e.g. Goal entity is not versioned (immutable) — OK for v1, may need audit versioning in v2>

## 12. Glossary

<!-- 🎯 Навіщо: ⭐ СЛОВНИК ДОМЕНУ, який припиняє суперечки через рік («checkpoint —      -->
<!--           weekly чи biweekly? Quarter — календарний чи фіскальний?»).                -->
<!-- 📋 Що писати: таблиця термін / значення. Бізнес-терміни + технічні вперемішку.       -->
<!--           Один термін може мати дві мови у заголовку: «Goal (Обʼєктив)».              -->
<!-- 📌 Приклад: «Lesson | урок усередині курсу, що складається з блоків (text, video)». -->

| Term | Meaning |
|---|---|
| <e.g. Goal> | <quarterly intent in statement form> |
| <e.g. KR> | <Key Result — measurable target linked to a Goal> |
| <e.g. Checkpoint> | <bi-weekly progress update on a KR> |
