import dotenv from 'dotenv';
dotenv.config();

export const RAG_CONFIG = {
  // Retrieval
  TOP_K: parseInt(process.env.RAG_TOP_K) || 5,
  SIMILARITY_THRESHOLD: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD) || 0.65,
  NUM_CANDIDATES_MULTIPLIER: 10,

  // Embedding
  EMBEDDING_MODEL: 'gemini-embedding-2',
  EMBEDDING_DIMENSIONS: 768,

  // Chunking
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 75,

  // MongoDB Atlas Vector Search
  VECTOR_INDEX_NAME: 'vector_index',
};
