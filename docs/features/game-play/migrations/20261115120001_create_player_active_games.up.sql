CREATE TABLE IF NOT EXISTS player_active_games (
    player_id  UUID        PRIMARY KEY,
    game_id    UUID        NOT NULL REFERENCES games (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_player_active_games_game_id ON player_active_games (game_id);
