import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { RAG_CONFIG } from '../config/ragConfig.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate an embedding for a single text string.
 * Used for query-time embedding (once per user question).
 *
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - 768-dimensional embedding vector
 */
export const generateEmbedding = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  try {
    const response = await ai.models.embedContent({
      model: RAG_CONFIG.EMBEDDING_MODEL,
      contents: text,
      config: {
        outputDimensionality: RAG_CONFIG.EMBEDDING_DIMENSIONS,
      },
    });

    return response.embeddings[0].values;
  } catch (error) {
    if (error.status === 429) {
      console.error('[Embedding] Rate limit hit, retrying after 2s...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return generateEmbedding(text);
    }
    console.error('[Embedding] Failed to generate embedding:', error.message);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Generate embeddings for multiple texts in batches.
 * Used during document ingestion (one-time per document).
 *
 * The Gemini embedContent API accepts an array of strings,
 * returning all embeddings in a single call. We batch to stay
 * within API limits.
 *
 * @param {string[]} texts - Array of text strings to embed
 * @param {number} batchSize - Number of texts per API call (default: 100)
 * @returns {Promise<number[][]>} - Array of 768-dimensional vectors
 */
export const generateEmbeddings = async (texts, batchSize = 100) => {
  if (!texts || texts.length === 0) {
    return [];
  }

  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    try {
      const response = await ai.models.embedContent({
        model: RAG_CONFIG.EMBEDDING_MODEL,
        contents: batch,
        config: {
          outputDimensionality: RAG_CONFIG.EMBEDDING_DIMENSIONS,
        },
      });

      const batchEmbeddings = response.embeddings.map((e) => e.values);
      allEmbeddings.push(...batchEmbeddings);

      console.log(`[Embedding] Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} complete (${batchEmbeddings.length} embeddings)`);
    } catch (error) {
      if (error.status === 429) {
        console.warn('[Embedding] Rate limit hit, retrying batch after 3s...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        i -= batchSize; // Retry this batch
        continue;
      }
      console.error(`[Embedding] Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
      throw new Error(`Failed to generate embeddings for batch starting at index ${i}`);
    }
  }

  return allEmbeddings;
};
