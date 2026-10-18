# player

A player's public face between games: profile, rating, game history.

- **Status:** planned
- **Vocabulary:** Player, Profile, Rating, GameRecord
- **Publishes:** RatingChanged
- **Listens to:** UserRegistered (from auth); GameEnded (from game); SubscriptionStarted, PaymentFailed (from billing)

Talks to other contexts only via `shared/events` — never imports them directly.
Planned — folder holds this README only; layers and a Nest module appear when work on this context starts.
See `docs/bc-map.md` for the full map.
