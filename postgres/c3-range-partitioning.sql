-- Exercise C3 - Part 1: Range partitioning on created_at
-- Run after the documents-service has created and populated the documents table:
--   docker exec -it documents-postgres psql -U docuser -d documents_db -f /scripts/c3-range-partitioning.sql
--
-- Lab schema (simplified, as in LAB_8 PDF):

BEGIN;

ALTER TABLE IF EXISTS documents RENAME TO documents_old;

CREATE TABLE documents (
    id           BIGSERIAL,
    title        TEXT NOT NULL,
    created_at   DATE NOT NULL DEFAULT CURRENT_DATE,
    owner        TEXT
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

INSERT INTO documents (title, created_at, owner)
SELECT title,
       COALESCE(created_at::DATE, CURRENT_DATE),
       NULL
FROM documents_old;

DROP TABLE documents_old;

COMMIT;
