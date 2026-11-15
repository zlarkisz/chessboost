CREATE TABLE IF NOT EXISTS half_moves (
    game_id            UUID         NOT NULL REFERENCES games (id),
    number             INTEGER      NOT NULL,
    move_uci           VARCHAR(5)   NOT NULL,
    position_fen       VARCHAR(100) NOT NULL,
    repetition_key     VARCHAR(100) NOT NULL,
    mover_remaining_ms INTEGER      NOT NULL,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (game_id, number)
);
