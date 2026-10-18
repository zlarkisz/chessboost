# notifications

Tells people what happened: email / push / in-app messages in reaction to other contexts' events.

- **Status:** planned
- **Vocabulary:** Notification, Channel, Template, Recipient
- **Publishes:** — (listens only)
- **Listens to:** UserRegistered, MatchCreated, GameEnded, PaymentFailed

Talks to other contexts only via `shared/events` — never imports them directly.
Planned — folder holds this README only; layers and a Nest module appear when work on this context starts.
See `docs/bc-map.md` for the full map.
