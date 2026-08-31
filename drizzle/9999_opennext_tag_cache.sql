-- Tag cache table required by @opennextjs/cloudflare's D1 tag cache override
-- (binding NEXT_TAG_CACHE_D1). Kept outside the drizzle journal because it is
-- owned by OpenNext, not by the application schema.
CREATE TABLE IF NOT EXISTS revalidations (tag TEXT NOT NULL, revalidatedAt INTEGER NOT NULL, stale INTEGER, expire INTEGER DEFAULT NULL, UNIQUE(tag) ON CONFLICT REPLACE);
