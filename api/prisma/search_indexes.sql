-- Search indexes (trigram + full-text)
--
-- NOTE:
-- These indexes use Postgres operator classes / expressions (gin_trgm_ops, to_tsvector)
-- which Prisma cannot fully model. Keep them in this standalone script and run it
-- after `prisma migrate` to avoid Prisma generating "DropIndex" drift migrations.

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Stops
CREATE INDEX IF NOT EXISTS stops_search_text_trgm_idx
  ON stops USING GIN (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS stops_search_text_fts_idx
  ON stops USING GIN (to_tsvector('simple', search_text));

-- Routes
CREATE INDEX IF NOT EXISTS routes_search_text_trgm_idx
  ON routes USING GIN (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS routes_search_text_fts_idx
  ON routes USING GIN (to_tsvector('simple', search_text));
