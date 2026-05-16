-- Exercise C3 - Range partitioning adapted for the Spring Boot DMS documents table (UUID + timestamps)
-- Run manually after Hibernate has created the original table:
--   docker exec -it documents-postgres psql -U docuser -d documents_db -f /scripts/c3-range-partitioning-dms.sql

BEGIN;

ALTER TABLE documents RENAME TO documents_old;

CREATE TABLE documents (
    id           UUID NOT NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    file_name    TEXT,
    file_size    BIGINT,
    content_type TEXT,
    object_key   TEXT,
    has_file     BOOLEAN,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE documents_2025_q1 PARTITION OF documents
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE documents_2025_q2 PARTITION OF documents
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

CREATE TABLE documents_2025_q3 PARTITION OF documents
    FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');

CREATE TABLE documents_2025_q4 PARTITION OF documents
    FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');

CREATE TABLE documents_default PARTITION OF documents DEFAULT;

INSERT INTO documents
SELECT id, title, description, file_name, file_size, content_type, object_key, has_file,
       COALESCE(created_at, CURRENT_TIMESTAMP),
       updated_at
FROM documents_old;

DROP TABLE documents_old;

COMMIT;
