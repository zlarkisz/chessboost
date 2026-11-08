---
name: cb-interview
description: >-
  Runs a 14-phase ideation interview for one feature (Socratic questions, competitor
  research, three strategic approaches, multi-role review, devil's advocate, RICE and
  feasibility) and writes docs/features/<slug>/idea-brief.md, extending CONTEXT.md.
  Tuned for a solo developer working with agents: reads the project's own CLAUDE.md and
  CONTEXT.md instead of assuming a team or company. Keeps glossary definitions free of
  open rules, uses behavioural metrics (no surveys), separates Impact from Confidence,
  keeps prerequisite features out of Effort, and requires the cheapest offline prototype
  (paper playtest, paper sketch) before the PRD.
  Use when asked for "/cb-interview <slug>", "solo interview", "інтерв'ю фічі",
  "бриф для соло-проєкту".
  For team or company products with a PM, stakeholders and quarterly reach, use
  /sdlc:interview instead.
argument-hint: <feature-slug>
---

# Skill: interview (SDLC ideation phase — single entry-point)

Consolidated 14-phase ideation runner. Single entry-point for the ideation phase. Replaces the prior atomic trio `intake` + `brainstorm` + `interview` with one autonomous Claude-driven protocol. Output: a single `docs/features/<slug>/idea-brief.md` with 15 sections (≤5 pages), no separate `brainstorm.md` / `initiatives.md`.

## Why this consolidation

Single entry-point for ideation. Replaces intake + brainstorm + interview. Autonomous Claude-driven research (competitive analysis, strategic approaches, multi-perspective review, devil's advocate, RICE/Feasibility proposals) with user confirms via AskUserQuestion. No more user-input RICE numbers («calculator game»). No more separate brainstorm.md / initiatives.md. ADR is not a gate-1 concern — it moves to gate 3 (after sad.md (architecture-design) §Trade-offs); the ideation phase stays pure product.

## Owner

Idea author — a solo developer working with agents, who holds every role (product, engineer, player/user). There is no PM or Tech Lead to defer to. Each AskUserQuestion names the role the answer is given in («як автор продукту», «як інженер», «як гравець») — staying aware of the current role is the solo discipline.

## When to use

- «capture an idea <slug>», «new brief for <feature>», «raw idea for <feature>».
- «interview a feature <slug>», «ideation for <slug>», «brief for <feature>».
- «intake feature <slug>», «start new feature with CONTEXT», «full intake for <slug>».
- `/cb-interview <slug>` as explicit invocation.
- Not for a brand-new empty project (no repo yet) — use `/sdlc:interview` there; this skill works on one feature inside an existing repo.
- User drops a raw idea in prose and asks «format this per SDLC» / «run ideation for <slug>».
- Glossary-aware: on start the skill reads `CONTEXT.md` if it exists (repo root or `docs/features/<slug>/`), keeps the glossary as session state, and triggers `sdlc:fix-term` inline for new domain terms.
- Skip if `docs/features/<slug>/idea-brief.md` already exists with `status: Confirmed` and is fresh (≤2 weeks) — update it first, don't rewrite.

## Inputs

- `<slug>` — kebab-case, short (`rate-limiting`, `goals-tracking`). If the user didn't give one — suggest 2-3 options based on the idea.
- (Optional) prior notes / links / ticket the user already has.

## Dependencies

- Plugin `sdlc` — this skill calls `sdlc:fix-term` (glossary) and hands off to `sdlc:write-prd`. Without the plugin: write glossary lines by hand in the same format and stop after Phase 14.
- Web search: Tavily first, built-in WebSearch as fallback (Phase 4).

## Depth regulator (first checkpoint)

Перше AskUserQuestion кожного запуску — глибина інтерв'ю. Записується у frontmatter brief-а (`depth:`).

- **easy** — 3–4 чекпойнти, швидкий прохід: Phase 1 (ідея), Phase 2 одним батчем (2–3 питання: користувач/біль · критерій успіху · скоуп), Phases 9–11 злиті в один підсумковий confirm (Claude пропонує RICE + рекомендацію разом). Phases 4–8 Claude проходить сам без sub-agents: 1–2 швидкі пошуки для §6, три approaches по одному абзацу, devil's advocate — власний список з 3–5 ризиків. Всі 15 секцій заповнюються, але компактно.
- **medium** (default) — повний 14-фазний протокол нижче, як є.
- **hard** — повний протокол + додатковий Socratic-батч у Phase 2 і ширший §6 (5+ конкурентів).

Easy не скасовує чесність чекпойнтів: його 3–4 AskUserQuestion — справжні, фабрикація відповідей недопустима так само, як у medium/hard.

## Mode handling

**This skill is planning-mode-native.** Phases 0-11 виконуються повністю у read-only режимі (Read, WebSearch, Agent, AskUserQuestion). Лише на переході 11 → 12 викликається `ExitPlanMode` із synthesized planом, після чого Phase 12 копіює template і пише `idea-brief.md` на диск.

**Why:** AskUserQuestion checkpoints у Phases 1, 2, 9, 10, 11 — це не «clarifying questions», а **обовʼязковий data-input protocol**. Користувач має фактично зайти у глибину ідеї; без цього artifact = reconstruction з памʼяті моделі, не interview.

**Auto Mode override:** якщо у сесії активний `Auto Mode` system-reminder, він **не** скасовує AskUserQuestion-checkpoints у цьому skill. Auto Mode стосується «pause to check whether I should proceed»-моментів між фазами, не data input. Фабрикація raw idea, Socratic answers, RICE/Feasibility/Recommendation confirms = nullify whole interview.

## AskUserQuestion style — solo-developer Ukrainian

Кожен `AskUserQuestion` у цьому skill-у (Phases 1, 2, 9, 10, 11) формулюється так, щоб **розробник, для якого продуктова робота нова**, міг відповісти без помічника поряд. Кожну абревіатуру (RICE, AC, PRD, NFR…) при першій згадці розшифровувати в дужках. Одне питання = одне рішення: не змішувати визначення, правило і оцінку в одному checkpoint.

**Mandatory shape:**

1. **Українська мова всюди** — labels + descriptions. Технічні ідентифікатори (RICE, R/I/C/E score, Feasibility ☑/☐, Approach A/B/C) залишаються англійською — це назви; але «дії» опцій — українською («Прийняти Approach C», «Підкорегувати E нижче», «Позначити TBD», «Confirm + перейти до Phase 11»).

2. **`question` поле — 3-4 речення** з трьох блоків:
   - **КОНТЕКСТ** — звідки взялося це питання, на якій Phase ми зараз, що уже зібрано (1-line recap)
   - **ЧОМУ ВАЖЛИВО** — що зривається, якщо відповідь буде неправильною (напр. «RICE без розуміння Effort = decision based on wishful thinking; Phase 11 буде з кривим foundation»)
   - **ЯКА ДУМКА ПОТРІБНА** — на що дивитися перед вибором; чи треба перечитати prior phase output

3. **Option `description` — 3-5 речень** з трьох елементів:
   - **Що технічно станеться**: який рядок у idea-brief зміниться, які later phases на цю відповідь впливають
   - **Що опція означає простими словами** — без жаргону:
     - Не «RICE score 80, Approach C» → «RICE-формула (Reach × Impact × Confidence / Effort) дала 80 для варіанту C; це значить, що C виглядає більш виправданим за ресурсами, ніж A (60) або B (45) — але це Claude-прогноз, не facts»
     - Не «Feasibility 3/3 ☑» → «всі три блоки feasibility (Skills, Time, Tech) Claude позначив як «підтверджено» — це значить, що у команди є експертиза, у release-windows є місце, і tech-stack не блокує. Якщо щось з цього TBD — Phase 11 Recommendation буде з warning»
     - Не «strategic vector» → «головний напрям, у якому ми йдемо: напр., «спершу гра з друзями за посиланням, без публічного пошуку суперника» — все, що suggests розширення scope поза цей напрям, у Phase 8-9 буде flagged як scope creep»
   - **Hidden trade-off** — якщо опція має наслідок, який junior міг би не побачити (напр. «Mark recommendation as TBD» → «всі downstream skill-и (write-prd, architecture-design) hard-refuse поки status не Confirmed — це блокує всю SDLC-pipeline для цієї фічі») — згадати це прямо у description

**Заборонено:** стислі англомовні labels («Confirm», «Adjust», «TBD»); однорядкові descriptions; технічні терміни без розшифровки; trade-off-и заховані у follow-up.

**Why:** соло-розробник добре знає код, але не продуктову мову (сегмент, Reach, OKR). Питання в термінах компанії змушують його перекладати їх на свою ситуацію («сегмент» → «друзі, яким я скину посилання»), і на цьому перекладі губляться відповіді.

**Planning mode compatibility:** оскільки усі Write-операції зосереджені у Phase 12 (post-ExitPlanMode), skill коректно стартує у будь-якому permission mode (default / acceptEdits / plan / Auto). Якщо ExitPlanMode недоступний (тобто сесія була запущена не в plan mode) — Phase 12 виконується одразу після Phase 11, без переходу.

## Protocol

**14 phases. Phases 0-11 read-only. Phase 11.5 = ExitPlanMode. Phases 12-14 execute writes + self-check + commit propose.**

### 0. Pre-plan setup (read-only)

- **Read** `./templates/idea-brief.md` — завантажити skeleton у session memory (NO copy yet).
- **Read** `CONTEXT.md` (root and `docs/features/<slug>/` if exists) — завантажити `## Glossary` у session state.
- **Verify** `docs/features/<slug>/idea-brief.md` does not exist with `status: Confirmed` (else: skip, update existing).
- **Bootstrap gate.** Якщо `CONTEXT.md` немає або в ньому немає жодного терміна з домену фічі — **зупинитись** до Phase 1 і запропонувати bootstrap: 3–5 ключових термінів через `fix-term`. Без словника Phase 4 порівнює конкурентів за абстрактним поняттям, а не за значенням у цьому проєкті (симптом: однакова «Gap» у кількох конкурентів).
- **NO Write / Edit / mkdir.** Setup стає одним з steps плану, який буде виконано у Phase 12.

### 0.25. Depth checkpoint (AskUserQuestion — mandatory)

Одне питання: глибина (див. «Depth regulator»). easy → скорочений маршрут фаз; medium/hard → повний.

### 1. Idea capture (AskUserQuestion — mandatory)

One AskUserQuestion для raw paragraph: «опиши ідею в 1-3 реченнях своїми словами». Persist verbatim у session memory як §1 Raw idea draft. Не редагувати — це baseline.

### 2. Socratic deep dive (AskUserQuestion — mandatory)

Pick 3-5 питань з 5 категорій based on idea-shape:
- **Problem clarity** (що саме болить, для кого, як часто).
- **Solution validation** (що вже перевіряв на людях, що пробували раніше). Якщо нічого — запропонувати **найдешевший офлайн-прототип** під тип фічі:
  - ігрова механіка → партія на папері (дошка, кубик, жетони);
  - екран / UI → малюнок на папері, показати 2–3 людям;
  - сервіс / процес → зробити вручну те, що фіча мала б автоматизувати («Wizard of Oz»).

  Записати прототип у §15 як крок **до** `write-prd`. Confidence лишається 0.5, поки його не зроблено.
- **Success criteria** — одна метрика, яку видно з **поведінки** (повторна дія, повернення, завершення сценарію), зі стартовим значенням і ціллю. Опитування й оцінки «1–5» не пропонувати за замовчуванням: на малих аудиторіях (друзі, 10–20 людей) вони шумні й заважають досвіду. Страхувальна метрика, якщо потрібна, теж поведінкова (напр. кинуті сесії одразу після ключової події).
- **Constraints** — скільки тижнів свого часу автор готовий віддати саме цій фічі, і **які фічі-передумови** мають бути готові раніше. Передумови записати окремим списком (`prerequisites`): вони не входять в Effort цієї фічі.
- **Why now / personal fit** (чому ти робиш це саме зараз — власна давня ідея, навчання, запуск; у якому порядку виходиш на людей: друзі → спільнота → публічно). Записувати справжню причину, навіть якщо вона навчальна.

Delivery: AskUserQuestion батчами по 2-3 (не all-at-once).

### 3. Glossary capture (deferred fix-term)

На кожному новому domain-слові у відповідях користувача — додати term до session-state list `pending_glossary_terms`. **НЕ викликати** `sdlc:fix-term` зараз — це писало б у CONTEXT.md, що недопустимо у planning mode. Skip generic tech terms (HTTP, JSON, queue, cache, database). Terms apply-ються у Phase 12 (post-ExitPlanMode) перед Write idea-brief.md.

**Визначення ≠ правило.** Термін записується як «що це + NOT-межа». Якщо у відповіді є правило («скільки», «коли», «чи рахується», «хто обирає»), його відокремлюють від визначення:
- ще не вирішене → §15 Open questions;
- вирішене → `## Invariants` у `CONTEXT.md` (формат «X always must / can never»).

Рядок глосарію ніколи не містить відкритих питань чи правил.

### 4. Competitive research (Claude-driven, read-only)

Claude автономно:
- Спершу шукає готові дослідження в репо (`docs/research/`, `docs/**/competitors*`): якщо є свіже (≤ 1 місяць), бере його за основу й перевіряє лише 2–3 ключові рядки.
- Потім Tavily (fallback — WebSearch) для 3-5 конкурентів / adjacent solutions, яких бракує.
- Формує таблицю: **Product · URL · Features · Value (1-5 per feature) · Gap** у session memory.
- Кожен рядок з footnote: date and search query used.
- Якщо internal tool без market — `N/A — internal tool` з reason.

NO user input у цій фазі — Claude робить research, користувач лише review після.

### 5. Strategic approaches (3 паралельні Agent.tool calls, read-only)

Shared prompt template, 3 personas виконуються паралельно через окремі sub-agents:
- **Variant-A (Simplicity):** найкоротший шлях, MVP-style, мінімум moving parts.
- **Variant-B (Differentiation):** wow-factor / strategic moat / unique angle.
- **Variant-C (Balanced):** trade-off між A та B.

Кожен sub-agent повертає 1-paragraph approach з:
- **Name** (3-5 word).
- **Thesis** (1 sentence, product language — NO tech terms like Redis/Postgres/Kafka).
- **For whom** (which segment from §3 Users).
- **Outcome metric** (1 KPI: baseline → target).
- **Key trade-off** (1 line).
- **Effort signal**: S / M / L.

### 6. Multi-perspective review (3 паралельні Agent.tool calls, read-only)

Three personas виконуються паралельно через sub-agents, кожен бачить усі 3 approaches з §5:
- **Engineer** — concerns / risks / blockers. Explicitly told у prompt: «no library/DB names — abstract concerns only (latency, throughput, complexity, integration surface)» і «оцінюй лише цю фічу; передумови зі списку `prerequisites` (Phase 2) вважай готовими і не включай у складність».
- **Owner-investor** — чи варте це вечорів автора, що ще можна зробити за той самий час (opportunity cost), чи наближає це до наступного кола аудиторії.
- **UX-researcher** — user friction / discoverability / onboarding curve.

Кожен повертає 3-5 bullets з concerns / value / risks для **кожного** з 3 approaches.

Build §8 Synthesis matrix (3 personas × 3 approaches) з 6-word justifications per cell (+/0/-) у session memory.

### 7. Trade-offs + edge cases (synthesis, read-only)

Claude synthesizes у session memory (no user input — review/edit only):
- Trade-offs per approach: pros / cons table.
- 5-8 edge cases that any approach must handle (data, integrations, failure modes, ops).

### 8. Devil's advocate (1 Agent.tool call з clean context, read-only)

Spawn 1 sub-agent з чистим контекстом (NO upstream session memory), prompt: «знайди як це може провалитись. 5-10 attack vectors з production signals (що саме зламається, як це проявиться у monitoring/customer churn/incident)».

Найкритичніший attack vector → reserved для §10 Risks. Решта — для §9 Edge cases.

### 9. Claude-proposed RICE (AskUserQuestion — mandatory)

Claude обчислює R/I/C/E з upstream sections:
- **Reach** ← §3 Users: люди, яких автор реально може назвати поіменно або дістати за квартал (друзі, спільнота). Без «потенційної аудиторії».
- **Impact** ← §2 Problem severity + Owner-investor perspective bullets.
- **Confidence** ← кількість TBDs / open questions; багато unresolved → 0.5; всі факти конкретні → 1.0.
- **Effort** ← Effort signal з §7 approaches (S = 1-2 person-weeks, M = 3-5, L = 6-12), **без** передумов з `prerequisites`. Кожна передумова — окремий рядок у §15 («потребує власного brief»).

**Impact ≠ Confidence.** Impact — наскільки сильно зміниться досвід, **якщо** фіча спрацює. Confidence — наскільки **ймовірно**, що спрацює. Те, що лише знижує ризик (анонс, підказка, запобіжник), підвищує Confidence, а не Impact. Різниця в Impact між підходами має спиратися на те, що користувач **відчуває інакше**, а не на те, що менше ризикує.

Compute `R × I × C / E`. AskUserQuestion per number (4 окремі checkpoints або 1 multiSelect батч) з опціями: `Confirm N` / `Adjust higher` / `Adjust lower` / `Mark TBD`. Rationale у idea-brief цитує upstream секцію.

**Підсумкова таблиця перед Submit.** Після чотирьох checkpoint і до підтвердження показати таблицю `Підхід · R · I · C · E · RICE` для **всіх** підходів:
- числа — лише з останніх відповідей автора; зміна одного числа перераховується в усіх рядках;
- значення — тільки зі шкали (I: 0.25 / 0.5 / 1 / 2 / 3; C: 0.5 / 0.7 / 0.8 / 1.0); значення поза шкалою — помилка, виправити до показу;
- **чутливість:** якщо зміна одного числа на один крок шкали перевертає порядок підходів — написати про це прямо. Тоді Phase 11 не спирається на RICE як на головний аргумент.

### 10. Claude-proposed Feasibility (read-only repo scan + AskUserQuestion — mandatory)

Claude scans the project repo (read-only `find`/`ls`/`Glob` over feature dirs `docs/features/`, `src/`, `app/`, `pkg/`, `services/`, project-specific paths) для adjacent features which already shipped similar tech / workflow.

Proposes 3 checkboxes:
- **Tech** ☑/☐ — з обґрунтуванням («similar to <existing feature> in <module>»).
- **Skills** ☑/☐ — з обґрунтуванням («team already shipped <X>, same skill applies»).
- **Time** ☑/☐ — з обґрунтуванням («similar feature <X> shipped in <N> weeks»). Рахується без передумов; якщо вони не готові, Tech отримує умову «за готової передумови», а не ☐.

AskUserQuestion per checkbox (3 окремі або 1 multiSelect батч): `Confirm ☑` / `Flip to ☐ — <reason>` / `TBD`.

### 11. Recommendation synthesis (AskUserQuestion — mandatory)

Claude picks один з 3 approaches з §5 + writes 3-5 sentence rationale у session memory.

Rationale MUST explicitly cite:
- RICE score from §11.
- Feasibility state from §12.
- ≥1 multi-perspective synthesis matrix cell from §8.
- ≥1 competitive gap from §6.

AskUserQuestion для user confirm: `Accept recommendation` / `Pick different approach` / `Mark recommendation as TBD`.

### 11.5. ExitPlanMode handoff (planning → execute)

Усе вище — session memory only. Тепер skill **викликає `ExitPlanMode`** з planом який містить:

1. Create directory `docs/features/<slug>/` (if absent).
2. Copy template `./templates/idea-brief.md` → `docs/features/<slug>/idea-brief.md`.
3. Apply pending glossary terms (Phase 3 list) via `sdlc:fix-term` to `CONTEXT.md`.
4. Fill 15 sections + Related + DoD self-check у новому файлі з усього session memory (Phases 1-11).
5. Update frontmatter: `status: Confirmed`, `value_score.{rice,state,confirmed_at}`, `feasibility_state: confirmed`.
6. Run Phase 13 self-check (regex, length, citations).
7. Propose commit + next owner.

Якщо ExitPlanMode tool недоступний (skill стартував не у plan mode) — пропустити цей step і виконати Phase 12 напряму. План у session memory залишається тим самим.

### 12. Execute: fill expanded idea-brief

Після `ExitPlanMode` (або одразу, якщо plan mode не активний):

- **mkdir** `docs/features/<slug>/` if absent.
- **Copy** template → `docs/features/<slug>/idea-brief.md`.
- **Apply** pending glossary terms (call `sdlc:fix-term` for each, якщо що).
- **Edit/Write** усі секції 1-15 + Related + DoD self-check з session memory. Update frontmatter:
  - `status: Confirmed`
  - `value_score.rice: <N>`, `value_score.state: confirmed`, `value_score.confirmed_at: <today YYYY-MM-DD>`
  - `feasibility_state: confirmed`
  - `updated_at: <today>`

Parked approaches (2 non-recommended з §5) — у §14 з reason + revisit trigger.

### 13. Self-check vs DoD

Run all checks (Read + grep over the file just written):
- **15 sections present.** Все 1-15 + Related + DoD self-check filled.
- **No anti-pattern terms у body.** Regex check (excluding DoD self-check meta-line): `\b(Postgres|Redis|Kafka|MySQL|SM-2|FSRS|Leitner|SQLAlchemy|gorm|JSONB)\b` + `p99`. **Word-boundary важливий**: `chi` як substring у «architecture» — false positive; додати `\b`.
- **Length ≤ 5 pages** (~2200 words ±10%). If over — compress §5 Approaches paragraphs and §6 Competitive table.
- **Rationale citations.** §13 Recommendation cites §6 (1 gap) + §8 (1 cell) + §11 (RICE) + §12 (Feasibility).

If any check fails → identify offending section, re-Edit it, then re-check.

### 14. Propose commit + next owner

Suggest commit (do not auto-execute):

```
docs(<slug>): 01 idea brief via interview
```

Next owner: ти (роль: продукт) → `sdlc:write-prd <slug>` (gate тепер з idea-brief.md `status: Confirmed`). Якщо в §15 є офлайн-прототип — спершу він, потім write-prd.

ADR (`sdlc:architecture-design`) НЕ викликається на gate 1 — це gate 3 concern (after sad.md (architecture-design) §Trade-offs). Якщо рекомендація з §13 виглядає як hard-to-reverse technical choice — note that у §15 Open questions, але don't open ADR thread here.

## Questions for discussion

- Який слаг — kebab-case, short, no date?
- Кого конкретно ти покличеш першим (поіменно) і в якому порядку підеш далі?
- Чому саме зараз — власна ідея, навчання, запуск?
- Яку поведінку людей ти побачиш, якщо це спрацювало?
- Що з цього можна перевірити на папері до першого рядка коду?
- Чи погоджуєшся з Claude-proposed RICE numbers — чи треба коригувати?
- Чи всі 3 Feasibility checkboxes реально закриті, чи десь є unknown?

## Definition of Done

- `docs/features/<slug>/idea-brief.md` created and committed.
- All 15 sections filled (no empty H2, `<!-- TBD -->` allowed where honestly missing).
- No anti-pattern tech terms у тілі (verified by internal regex check, word-boundaries on).
- Length ≤ 5 pages (~2200 words ±10%).
- Frontmatter `status: Confirmed`, `value_score.state: confirmed`, `feasibility_state: confirmed`, `confirmed_at: <date>`.
- §13 Recommendation rationale cites RICE (§11) + Feasibility (§12) + ≥1 multi-perspective cell (§8) + ≥1 competitive gap (§6).
- If Confidence < 0.7, §15 contains a step with the cheapest offline prototype (Phase 2, Solution validation).
- **AskUserQuestion checkpoints actually fired** у Phases 1, 2, 9, 10, 11 (verify через user-message trail). Якщо хоч один був фабрикований → artifact NOT DoD-valid.
- Next-stage owner assigned (author, product role → `sdlc:write-prd`).

## Anti-patterns

- **Inventing competitors because «we need to write something».** Better `N/A — internal tool` with reason than fake research. Competitors = «all the same» without links — that's not research, that's laziness. Phase 4 must produce real URLs + features + value ratings.
- **User-input RICE («calculator game»).** Old skill asked user for Reach/Impact/Confidence/Effort — user has no grounding to answer. New flow: Claude proposes from upstream sections (Users → Reach, Owner-investor perspective → Impact, TBDs → Confidence, Effort signal → Effort). User only confirms or adjusts.
- **Tech terms in idea-brief body** (Postgres, Redis, Kafka, SM-2, FSRS, p99 latency, JSONB). This is a PRODUCT brief. Tech lives у PRD §6 + sad.md (architecture-design) + ADR (gate 3+). Phase 13 self-check enforces this.
- **Single approach in §5.** Strategic approaches MUST be 3 (Simplicity / Differentiation / Balanced). One approach = decision already taken, nothing to evaluate.
- **Skip multi-perspective review.** Engineer-only view → blind to business / UX risks. Owner-investor-only view → blind to implementation cost. Need all 3 perspectives in §6 to balance.
- **Devil's advocate from same session context.** Phase 8 MUST spawn sub-agent з clean context, otherwise it's biased by all the optimism upstream.
- **Skip Feasibility repo scan.** Phase 10 must do `find`/`ls` over feature dirs and cite adjacent shipped features. «Tech: ☑ — we know how» without citation = guess.
- **Recommendation без rationale citing 4 upstream sections.** Phase 11 rationale MUST cite §6 (competitive gap), §8 (multi-perspective cell), §11 (RICE), §12 (Feasibility). Otherwise it's «I feel like A».
- **Propose ADR at end of phase 14.** ADR moves to gate 3 (after sad.md (architecture-design)). Gate 1 is pure product — no tech locks-in.
- **Brainstorm-style transcript dump.** §14 Parked & rejected is structured (table with status / reason / revisit trigger), not raw chat log.
- **Solution-mode prose in §2 Problem.** «We need to add Redis» → wrong section. §2 is the problem only; solutions live у §7 Approaches.
- **Fabricating user answers under Auto Mode.** `Auto Mode Active` system-reminder каже «work without stopping for clarifying questions» — це стосується pause-to-check моментів, а не in-flow AskUserQuestion checkpoints цього skill. Phases 1, 2, 9, 10, 11 MUST fire real AskUserQuestion-и; генерувати raw idea / Socratic answers / RICE confirms / Feasibility confirms / recommendation accept без user-input = reconstruction artifact, не interview. Якщо AskUserQuestion відкинуто через permission denial — зупинитись і повідомити користувача, не обходити.
- **Writing files inside planning mode.** Phases 0-11 read-only. Якщо skill стартував у plan mode і ти спробуєш Write/Edit/mkdir раніше ніж ExitPlanMode (Phase 11.5) — permission deny. Тримай весь artifact у session memory до Phase 12.

## Template

→ [./templates/idea-brief.md](./templates/idea-brief.md)

## Example invocation

Приклад з реального прогону (pet-проєкт, онлайн-шахи з бустами, фіча `boosts`). Ілюструє потік, а не прив'язує скіл до цього домену.

> **User:** `/cb-interview boosts`
>
> 1. **Phase 0** — читає шаблон, `CONTEXT.md` (7 термінів), знаходить `docs/research/competitors-*.md`. Bootstrap-ворота пройдені: словник є.
> 2. **Phase 1** — автор описує ідею своїми словами; «раз на 7 ходів» → уточнення «напівходів», бо так у словнику.
> 3. **Phase 2** — Socratic: перші гравці → «друзі, яким я скину посилання», далі спільнота, далі стрімери. Метрика — поведінкова: реванш ≥ 40 % пар, без опитувань. Передумова — сама гра в шахи, вона поза Effort. Валідації ще не було → у §15 паперовий плейтест до write-prd.
> 4. **Phase 3** — «хто обирає клітинку телепорту» — правило, не визначення → §15; після рішення → `## Invariants`.
> 5. **Phases 4–8** — конкуренти з готового research + 3 перевірені рядки; підходи A (раптовий буст) / B (картки моментів) / C (анонс бустів); Engineer · Owner-investor · UX; devil's advocate у чистому контексті: «один підбір вирішує партію».
> 6. **Phase 9** — анонс у C знижує ризик → Confidence, не Impact; I однаковий для A і C. Таблиця перед Submit: A 4.0 · C 2.9 · B 2.1 (R = 10 — друзі поіменно).
> 7. **Phases 10–11** — Feasibility 3/3 за умови готової передумови; рекомендація A, C parked з тригером «реванш < 40 % + "вирішив рандом"».
> 8. **Phases 12–14** — пише brief, переносить вирішені правила в `## Invariants`, пропонує коміт `docs(boosts): 01 idea brief via interview`. Next: паперовий плейтест → `sdlc:write-prd boosts`.
