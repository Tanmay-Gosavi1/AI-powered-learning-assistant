import mongoose from 'mongoose';
import DocumentChunk from '../models/DocumentChunk.js';
import { generateEmbedding } from './embeddingService.js';
import { RAG_CONFIG } from '../config/ragConfig.js';

/**
 * Retrieve semantically relevant chunks for a user query using
 * MongoDB Atlas Vector Search.
 *
 * Flow:
 *   1. Generate query embedding
 *   2. $vectorSearch on DocumentChunk collection (filtered by documentId)
 *   3. Apply similarity threshold
 *   4. Return clean chunk objects with scores
 *
 * @param {Object} params
 * @param {string} params.documentId - The document to search within
 * @param {string} params.query - The user's question
 * @param {number} [params.topK] - Max chunks to return
 * @param {number} [params.similarityThreshold] - Minimum similarity score
 * @returns {Promise<Array<{content, chunkIndex, pageNumber, score, _id}>>}
 */
export const retrieveRelevantChunks = async ({
  documentId,
  query,
  topK = RAG_CONFIG.TOP_K,
  similarityThreshold = RAG_CONFIG.SIMILARITY_THRESHOLD,
}) => {
  if (!query || query.trim().length === 0) {
    console.log('[RAG] Empty query, returning no chunks');
    return [];
  }

  if (!documentId) {
    throw new Error('documentId is required for retrieval');
  }

  try {
    // Step 1: Generate query embedding (one API call per question)
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: MongoDB Atlas Vector Search
    const numCandidates = topK * RAG_CONFIG.NUM_CANDIDATES_MULTIPLIER;

    const results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: RAG_CONFIG.VECTOR_INDEX_NAME,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: numCandidates,
          limit: topK,
          filter: {
            documentId: new mongoose.Types.ObjectId(documentId),
          },
        },
      },
      {
        $project: {
          content: 1,
          chunkIndex: 1,
          pageNumber: 1,
          documentId: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    // Step 3: Apply similarity threshold
    const filtered = results.filter((chunk) => chunk.score >= similarityThreshold);

    // Step 4: Logging for debugging
    console.log(`[RAG] Query: "${query.substring(0, 80)}${query.length > 80 ? '...' : ''}"`);
    console.log(`[RAG] Top ${topK} | Threshold: ${similarityThreshold}`);
    if (results.length > 0) {
      console.log('[RAG] Retrieved:');
      results.forEach((c) => {
        const passed = c.score >= similarityThreshold ? '✓' : '✗';
        console.log(`  ${passed} chunk ${c.chunkIndex} → ${c.score.toFixed(4)}`);
      });
    } else {
      console.log('[RAG] No results from vector search');
    }
    console.log(`[RAG] After threshold: ${filtered.length}/${results.length} chunks retained`);

    return filtered;
  } catch (error) {
    console.error('[RAG] Retrieval error:', error.message);

    // If vector search fails, return empty
    // rather than crashing — the chat prompt handles "no context" gracefully
    if (error.message.includes('vectorSearch') || error.codeName === 'InvalidPipelineOperator') {
      console.warn('[RAG] Vector search index may not be configured. Returning empty results.');
      return [];
    }

    throw error;
  }
};
