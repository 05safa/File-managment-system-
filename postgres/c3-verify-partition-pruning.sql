-- Exercise C3 - Part 2: Query and verify partition pruning

-- Confirm rows land in the correct partition
SELECT tableoid::regclass AS partition, *
FROM documents
WHERE created_at BETWEEN '2025-01-01' AND '2025-03-31';

-- Inspect the query plan to confirm partition pruning
EXPLAIN ANALYSE
SELECT * FROM documents
WHERE created_at = '2025-02-15';

-- Expected: EXPLAIN output scans only documents_2025_q1, not all partitions
