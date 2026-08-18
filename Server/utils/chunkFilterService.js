/**
 * Chunk Filter Service
 *
 * Filters and prepares chunk-based text for flashcard, quiz, and summary
 * generation. Prioritizes educational content over boilerplate like
 * table of contents, bibliography, author info, and references.
 *
 * This does NOT use embeddings or vector search — it works on the raw
 * chunk text from DocumentChunk records, ordered by chunkIndex.
 */

// Patterns that indicate non-educational boilerplate content
const BOILERPLATE_PATTERNS = [
  /^table\s+of\s+contents$/im,
  /^contents$/im,
  /^\s*references\s*$/im,
  /^\s*bibliography\s*$/im,
  /^\s*works?\s+cited\s*$/im,
  /^\s*about\s+the\s+authors?\s*$/im,
  /^\s*author\s+biograph/im,
  /^\s*acknowledgments?\s*$/im,
  /^\s*index\s*$/im,
  /^\s*appendix\s*$/im,
  /^\s*glossary\s*$/im,
  /^\s*list\s+of\s+(figures|tables|abbreviations)\s*$/im,
];

// If a chunk is mostly citations/references (e.g., [1] Author, Year...)
const CITATION_HEAVY_PATTERN = /(\[\d+\]|\(\d{4}\)|et\s+al\.|pp?\.\s*\d+)/g;
const CITATION_DENSITY_THRESHOLD = 0.05; // >5% of words are citation markers

/**
 * Check if a chunk is likely boilerplate (TOC, bibliography, etc.)
 * @param {string} content - Chunk text
 * @returns {boolean}
 */
const isBoilerplate = (content) => {
  // Check if the chunk starts with a boilerplate heading
  const firstLine = content.split('\n')[0] || '';
  for (const pattern of BOILERPLATE_PATTERNS) {
    if (pattern.test(firstLine)) {
      return true;
    }
  }

  // Check if the chunk is citation-heavy
  const words = content.split(/\s+/).length;
  const citationMatches = (content.match(CITATION_HEAVY_PATTERN) || []).length;
  if (words > 10 && citationMatches / words > CITATION_DENSITY_THRESHOLD) {
    return true;
  }

  return false;
};

/**
 * Filter chunks to prioritize educational content.
 * Returns the text from non-boilerplate chunks, concatenated and
 * truncated to fit within the token/character budget.
 *
 * @param {Array<{content: string, chunkIndex: number}>} chunks - Ordered chunks
 * @param {number} maxChars - Max total characters of output (default: 15000)
 * @returns {string} - Filtered and concatenated text
 */
export const getEducationalContent = (chunks, maxChars = 15000) => {
  if (!chunks || chunks.length === 0) {
    return '';
  }

  // Sort by chunkIndex to preserve document order
  const sorted = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);

  const educationalChunks = [];
  let totalChars = 0;

  for (const chunk of sorted) {
    if (isBoilerplate(chunk.content)) {
      continue;
    }

    const content = chunk.content.trim();
    if (content.length === 0) {
      continue;
    }

    // Stop if we'd exceed the budget
    if (totalChars + content.length > maxChars) {
      // Add partial if there's room for at least 200 chars
      const remaining = maxChars - totalChars;
      if (remaining > 200) {
        educationalChunks.push(content.substring(0, remaining));
      }
      break;
    }

    educationalChunks.push(content);
    totalChars += content.length;
  }

  return educationalChunks.join('\n\n');
};

/**
 * Get educational content from chunks, split into batches.
 * Useful when you want to process sections of a long document
 * separately (e.g., generate flashcards from different parts).
 *
 * @param {Array<{content: string, chunkIndex: number}>} chunks - Ordered chunks
 * @param {number} batchCharSize - Target chars per batch (default: 10000)
 * @returns {string[]} - Array of text batches
 */
export const getEducationalContentBatches = (chunks, batchCharSize = 10000) => {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  const sorted = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);

  const batches = [];
  let currentBatch = [];
  let currentSize = 0;

  for (const chunk of sorted) {
    if (isBoilerplate(chunk.content)) {
      continue;
    }

    const content = chunk.content.trim();
    if (content.length === 0) {
      continue;
    }

    if (currentSize + content.length > batchCharSize && currentBatch.length > 0) {
      batches.push(currentBatch.join('\n\n'));
      currentBatch = [];
      currentSize = 0;
    }

    currentBatch.push(content);
    currentSize += content.length;
  }

  // Push remaining
  if (currentBatch.length > 0) {
    batches.push(currentBatch.join('\n\n'));
  }

  return batches;
};
