CREATE TABLE IF NOT EXISTS rematch_offers (
    id         UUID        PRIMARY KEY,
    game_id    UUID        NOT NULL REFERENCES games (id),
    offered_by VARCHAR(5)  NOT NULL,
    closed_at  TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rematch_offers_open_game_id ON rematch_offers (game_id) WHERE closed_at IS NULL;
