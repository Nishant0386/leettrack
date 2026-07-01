-- infrastructure/docker/init.sql
-- Runs once when the Postgres container is first created.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
