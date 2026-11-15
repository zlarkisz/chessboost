CREATE TABLE IF NOT EXISTS game_commands (
    game_id    UUID        NOT NULL REFERENCES games (id),
    command_id UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (game_id, command_id)
);
