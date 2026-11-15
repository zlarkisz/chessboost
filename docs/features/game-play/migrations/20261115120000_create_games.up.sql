CREATE TABLE IF NOT EXISTS games (
    id                 UUID         PRIMARY KEY,
    match_id           UUID         NULL,
    previous_game_id   UUID         NULL REFERENCES games (id),
    white_player_id    UUID         NOT NULL,
    white_nickname     VARCHAR(32)  NOT NULL,
    white_rating       INTEGER      NULL,
    black_player_id    UUID         NOT NULL,
    black_nickname     VARCHAR(32)  NOT NULL,
    black_rating       INTEGER      NULL,
    base_seconds       INTEGER      NOT NULL,
    increment_seconds  INTEGER      NOT NULL,
    status             VARCHAR(16)  NOT NULL,
    position_fen       VARCHAR(100) NOT NULL,
    half_move_count    INTEGER      NOT NULL,
    white_remaining_ms INTEGER      NOT NULL,
    black_remaining_ms INTEGER      NOT NULL,
    turn_started_at    TIMESTAMPTZ  NOT NULL,
    draw_offered_by    VARCHAR(5)   NULL,
    white_draw_blocked BOOLEAN      NOT NULL,
    black_draw_blocked BOOLEAN      NOT NULL,
    end_reason         VARCHAR(32)  NULL,
    winner_color       VARCHAR(5)   NULL,
    finished_at        TIMESTAMPTZ  NULL,
    version            INTEGER      NOT NULL,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_games_match_id ON games (match_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_games_previous_game_id ON games (previous_game_id);

CREATE INDEX IF NOT EXISTS idx_games_active_turn_started_at ON games (turn_started_at) WHERE status = 'active';
