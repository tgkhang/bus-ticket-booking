-- Enable extensions for full-text + fuzzy search
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================
-- Stops: search_text + triggers + indexes
-- =====================
ALTER TABLE stops
  ADD COLUMN IF NOT EXISTS search_text TEXT;

UPDATE stops
SET search_text = lower(unaccent(coalesce(name, '') || ' ' || coalesce(address, '')))
WHERE search_text IS NULL;

CREATE OR REPLACE FUNCTION stops_set_search_text()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_text := lower(unaccent(coalesce(NEW.name, '') || ' ' || coalesce(NEW.address, '')));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stops_set_search_text ON stops;
CREATE TRIGGER trg_stops_set_search_text
BEFORE INSERT OR UPDATE OF name, address
ON stops
FOR EACH ROW
EXECUTE FUNCTION stops_set_search_text();

CREATE INDEX IF NOT EXISTS stops_search_text_trgm_idx
  ON stops USING GIN (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS stops_search_text_fts_idx
  ON stops USING GIN (to_tsvector('simple', search_text));

-- =====================
-- Routes: search_text + triggers + indexes
-- =====================
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS search_text TEXT;

-- Backfill route.search_text using current stop names
UPDATE routes r
SET search_text = lower(unaccent(
  coalesce(r.name, '') || ' ' ||
  coalesce(os.name, '') || ' ' || coalesce(os.address, '') || ' ' ||
  coalesce(ds.name, '') || ' ' || coalesce(ds.address, '')
))
FROM stops os, stops ds
WHERE os.id = r."originStopId"
  AND ds.id = r."destinationStopId"
  AND r.search_text IS NULL;

CREATE OR REPLACE FUNCTION routes_build_search_text(route_name TEXT, origin_stop_id UUID, destination_stop_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  os_name TEXT;
  os_addr TEXT;
  ds_name TEXT;
  ds_addr TEXT;
BEGIN
  SELECT name, address INTO os_name, os_addr FROM stops WHERE id = origin_stop_id;
  SELECT name, address INTO ds_name, ds_addr FROM stops WHERE id = destination_stop_id;

  RETURN lower(unaccent(
    coalesce(route_name, '') || ' ' ||
    coalesce(os_name, '') || ' ' || coalesce(os_addr, '') || ' ' ||
    coalesce(ds_name, '') || ' ' || coalesce(ds_addr, '')
  ));
END;
$$;

CREATE OR REPLACE FUNCTION routes_set_search_text()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_text := routes_build_search_text(NEW.name, NEW."originStopId", NEW."destinationStopId");
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_routes_set_search_text ON routes;
CREATE TRIGGER trg_routes_set_search_text
BEFORE INSERT OR UPDATE OF name, "originStopId", "destinationStopId"
ON routes
FOR EACH ROW
EXECUTE FUNCTION routes_set_search_text();

-- Keep routes.search_text consistent when a stop name/address changes
CREATE OR REPLACE FUNCTION stops_refresh_routes_search_text()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE routes r
  SET search_text = routes_build_search_text(r.name, r."originStopId", r."destinationStopId")
  WHERE r."originStopId" = NEW.id OR r."destinationStopId" = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stops_refresh_routes_search_text ON stops;
CREATE TRIGGER trg_stops_refresh_routes_search_text
AFTER UPDATE OF name, address
ON stops
FOR EACH ROW
EXECUTE FUNCTION stops_refresh_routes_search_text();

CREATE INDEX IF NOT EXISTS routes_search_text_trgm_idx
  ON routes USING GIN (search_text gin_trgm_ops);

CREATE INDEX IF NOT EXISTS routes_search_text_fts_idx
  ON routes USING GIN (to_tsvector('simple', search_text));
