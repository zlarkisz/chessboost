# Bounded Context Map

Event Storming lite for chessboost: 12 key domain events → 7 bounded contexts →
a shared vocabulary per context → who listens to whom.

## Events

1. **UserRegistered** — a player created an account
2. **MatchCreated** — two players were paired into one game
3. **GameStarted** — the game began, the clock is running
4. **MoveMade** — a player made a legal move
5. **GameEnded** — the game finished (EndReason: Mate / Resign / Timeout / Draw)
6. **BoostSquareSpawned** — after every 7th half-move a boost appeared on a free square
   (random type from a fixed set)
7. **BoostSquareExpired** — nobody stepped on the square in time, it disappeared
8. **BoostApplied** — a piece landed on the square, the effect applied immediately
9. **BoostExpired** — a lasting effect (e.g. invulnerability) ended
10. **RatingChanged** — a player's rating was updated after a game
11. **SubscriptionStarted** — a player subscribed
12. **PaymentFailed** — a subscription payment failed

## Contexts and vocabulary

| BC | Owns events | Vocabulary | Status |
|---|---|---|---|
| **auth** | UserRegistered | User, Session, RefreshToken, VerificationToken | planned |
| **player** | RatingChanged | Player, Profile, Rating, GameRecord | planned |
| **match** | MatchCreated | MatchRequest, Queue, Opponent, TimeControl | planned |
| **game** | GameStarted, MoveMade, GameEnded | Game, Board, Piece, Square, Move, Clock, EndReason | scaffolded |
| **boost** | BoostSquareSpawned, BoostSquareExpired, BoostApplied, BoostExpired | BoostSquare, BoostType, Effect, SpawnRule, Duration | scaffolded |
| **billing** | SubscriptionStarted, PaymentFailed | Subscription, Plan, Payment, Invoice | planned |
| **notifications** | — (listens only) | Notification, Channel, Template, Recipient | planned |

Polysemy is the boundary signal: a `Square` in **game** is a board coordinate (`e4`),
a `BoostSquare` in **boost** is an object with a lifecycle that only *refers* to a square;
a "user" is a `User` in **auth**, a `Player` in **player**, an `Opponent` in **match**
and a `Recipient` in **notifications**.

## BC Map

```mermaid
flowchart LR
  auth -- UserRegistered --> player
  auth -- UserRegistered --> notifications
  match -- MatchCreated --> game
  match -- MatchCreated --> notifications
  game -- MoveMade --> boost
  boost -- BoostSquareSpawned --> game
  boost -- BoostApplied --> game
  game -- GameEnded --> player
  game -- GameEnded --> notifications
  player -- RatingChanged --> match
  billing -- SubscriptionStarted --> player
  billing -- PaymentFailed --> player
  billing -- PaymentFailed --> notifications
```

**game ↔ boost** is a deliberate two-way link (the tightest on the map): boost listens to
moves to spawn squares, game listens to boost events to show squares and apply effects.
If it starts to hurt, boost effects could move into game's rules — revisit then.

## Structure level

**Feature-first** (one folder per BC, light Clean layers inside — see
[ADR 0001](adr/0001-initial-setup.md)). About 10 entities (upper end of the 3–10 range)
and one developer, so Hexagonal per BC would be premature; flat would mix 7 contexts.
**game** and **boost** are scaffolded first — they are the product core; the other
contexts have a folder with a README only until their turn comes.
