CREATE TABLE IF NOT EXISTS comments (
    doc_id uuid,
    comment_id timeuuid,
    content text,
    author text,
    PRIMARY KEY (doc_id, comment_id)
) WITH CLUSTERING ORDER BY (comment_id DESC);
