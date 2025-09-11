CREATE OR REPLACE FUNCTION similarity_search_interactions(
  query_embedding vector(1536),
  lead_uuid uuid,
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  embedding_id uuid,
  interaction_id uuid,
  similarity float,
  body text
) AS $$
  SELECT 
    e.id AS embedding_id,
    i.id AS interaction_id,
    1 - (e.embedding <=> query_embedding) AS similarity,
    i.body
  FROM embeddings e
  JOIN interactions i ON i.id = e.source::uuid  -- explicit cast from text → uuid
  WHERE i.lead_id = lead_uuid
    AND (1 - (e.embedding <=> query_embedding)) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql STABLE;
