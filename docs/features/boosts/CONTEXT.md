---
status: Living
updated_at: "2026-11-08"
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
- half-move — one move by one side (White or Black); the unit the boost spawn counter counts. NOT a full move (a White+Black pair, as in move numbering «1. e4 e5»).
- invulnerability — a boost type: the piece that took it cannot be captured during the opponent's next half-move. NOT a protected piece in the chess sense (one that may be captured but can be recaptured).
- spawn — the appearance of a new boost square, with a random boost type, on a random free (empty) square right after every 7th half-move. NOT applying a boost (that happens later, when a piece lands on the square).
- teleport — a boost type: the piece that took it is moved at once to another free (empty) square, ignoring normal movement rules. NOT a regular move or castling.

## Open questions

Temporary: once the interview moves an item to idea-brief §15 or resolves it into an Invariant, delete it here.

- [half-move] Does a turn granted by extra move count toward the spawn counter?
- [boost square] Can several boost squares exist at once, or does a new spawn replace the old one?
- [extra move] May any piece of that side make the extra half-move, or only the piece that took the boost?
- [extra move] What if the first half-move gives check — can the second capture the king, or must something else happen?
- [invulnerability] Does an invulnerable king ignore check?
- [spawn] Should a spawn avoid squares attacked by either side?
- [teleport] Who chooses the target square — the owner or chance?
- [teleport] Can the king be teleported, and may a piece be teleported into check or onto a square where it gives check?
