-- Add migration script here
CREATE TABLE server(
    server_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    voice_channel_id TEXT NOT NULL,
    name TEXT NOT NULL,
    songs JSONB NOT NULL
)