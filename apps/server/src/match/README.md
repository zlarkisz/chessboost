# match

Matchmaking: pairing two players into one game by time control and rating.

- **Status:** planned
- **Vocabulary:** MatchRequest, Queue, Opponent, TimeControl
- **Publishes:** MatchCreated
- **Listens to:** RatingChanged (from player)

Talks to other contexts only via `shared/events` — never imports them directly.
Planned — folder holds this README only; layers and a Nest module appear when work on this context starts.
See `docs/bc-map.md` for the full map.
