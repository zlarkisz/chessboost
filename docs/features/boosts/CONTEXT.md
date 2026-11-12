---
status: Living
updated_at: "2026-11-09"
---

# Domain Context — boosts

<!--
CONTEXT.md is the domain glossary — not a PRD and not a scratch pad. NO implementation
detail here (no datastore/broker/framework names, no API contracts) — only domain words
and the boundaries between them. Implementation choices live in the SAD and ADRs;
behaviour lives in PRD.md.

Multi-context repos: each bounded context has its own CONTEXT.md at its root path
(registered in CONTEXT-MAP.md). System-wide terms that span all contexts live in the
repo-root CONTEXT.md. Never duplicate a term across files — pick one owner.

Terms get fixed inline, the moment they surface in an interview / PRD / review — never
batched «I'll consolidate later». Empty H2 → prune before commit; keep only the sections
that carry real content. ## Glossary is mandatory; the other two are optional.
-->

## Glossary

<!-- One line per term: name · one-sentence canonical definition · one-sentence boundary
     (what it is NOT / the concept it gets confused with). Alphabetical once there are a few. -->
- boost — a single-use effect of one type from a fixed set (invulnerability, extra move, teleport) that a piece receives by landing on a boost square. NOT the boost square (the board cell that holds it until taken).
- boost square — an empty board square holding one boost that no piece has taken yet; the boost is consumed when a piece lands on it. NOT an ordinary square, and NOT the boost itself (the effect it grants).
- extra move — a boost type: the side whose piece took it makes one more half-move immediately, before the opponent moves. NOT a full move (only one extra half-move).
- half-move — system-wide term, defined in the repo-root [CONTEXT.md](../../../CONTEXT.md).
- invulnerability — a boost type: the piece that took it cannot be captured during the opponent's next half-move. NOT a protected piece in the chess sense (one that may be captured but can be recaptured).
- spawn — the appearance of a new boost square, with a random boost type, on a random free (empty) square right after every 13th half-move. NOT applying a boost (that happens later, when a piece lands on the square).
- teleport — a boost type: the piece that took it is moved at once to another free (empty) square, ignoring normal movement rules. NOT a regular move or castling.

## Invariants

<!-- Domain rules that hold across the whole feature/codebase — phrased «X always must / can
     never». These are rules ABOVE any single acceptance criterion, not PRD AC. -->
- A boost can never override king-safety rules: check must always be answered, and mate is always mate.
- If the first half-move of an extra move gives check, the second half-move is always forfeited (Marseillais chess precedent).
- The teleport target square must always be chosen by the owner of the teleported piece, never by chance.
