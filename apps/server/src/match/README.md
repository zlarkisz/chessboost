# match

Matchmaking: pairing two players into one game by time control and rating.

- **Status:** scaffolded
- **Vocabulary:** MatchRequest, Queue, Opponent, TimeControl
- **Publishes:** MatchCreated
- **Listens to:** RatingChanged (from player)

Talks to other contexts only via `shared/events` — never imports them directly.
Layers: `domain/`, `application/`, `infrastructure/`, `presentation/` + `match.module.ts`.
See `docs/bc-map.md` for the full map.
