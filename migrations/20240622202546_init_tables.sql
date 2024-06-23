-- Add migration script here
CREATE TABLE server(
    server_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    songs JSONB NOT NULL
)