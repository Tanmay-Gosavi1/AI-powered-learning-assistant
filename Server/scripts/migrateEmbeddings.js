/**
 * Migration Script: Generate embeddings for existing documents
 *
 * This script finds all documents with status 'ready' that don't yet have
 * DocumentChunk records, then generates embeddings and creates the chunks.
 *
 * Safe to run multiple times — it checks for existing chunks and won't duplicate.
 *
 * Usage:
 *   node scripts/migrateEmbeddings.js
 *
 * Optional env vars:
 *   MIGRATE_BATCH_SIZE - Documents to process at once (default: 10)
 *   MIGRATE_DRY_RUN   - Set to 'true' to preview without changes
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { chunkText } from '../utils/textChunker.js';
import { generateEmbeddings } from '../utils/embeddingService.js';
import { RAG_CONFIG } from '../config/ragConfig.js';

const BATCH_SIZE = parseInt(process.env.MIGRATE_BATCH_SIZE) || 10;
const DRY_RUN = process.env.MIGRATE_DRY_RUN === 'true';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const migrateDocuments = async () => {
  await connectDB();

  console.log('=== PrepMate Embedding Migration ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`Embedding model: ${RAG_CONFIG.EMBEDDING_MODEL}`);
  console.log(`Dimensions: ${RAG_CONFIG.EMBEDDING_DIMENSIONS}`);
  console.log(`Chunk size: ${RAG_CONFIG.CHUNK_SIZE} words, overlap: ${RAG_CONFIG.CHUNK_OVERLAP} words`);
  console.log('');

  // Find all ready documents
  const allReadyDocs = await Document.find({ status: 'ready' })
    .select('_id userId title')
    .lean();

  console.log(`Found ${allReadyDocs.length} documents with status 'ready'`);

  // Filter out documents that already have chunks in the DocumentChunk collection
  const docsNeedingMigration = [];
  for (const doc of allReadyDocs) {
    const existingChunkCount = await DocumentChunk.countDocuments({ documentId: doc._id });
    if (existingChunkCount === 0) {
      docsNeedingMigration.push(doc);
    } else {
      console.log(`Skip "${doc.title}" (${existingChunkCount} chunks already exist)`);
    }
  }

  console.log(`\n${docsNeedingMigration.length} documents need migration\n`);

  if (docsNeedingMigration.length === 0) {
    console.log('Nothing to migrate. All documents already have vector chunks.');
    await mongoose.disconnect();
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < docsNeedingMigration.length; i += BATCH_SIZE) {
    const batch = docsNeedingMigration.slice(i, i + BATCH_SIZE);

    for (const doc of batch) {
      try {
        console.log(`[${i + batch.indexOf(doc) + 1}/${docsNeedingMigration.length}] Migrating "${doc.title}"...`);

        // Load the full document with extractedText and chunks
        const fullDoc = await Document.findById(doc._id).lean();

        if (!fullDoc.extractedText && (!fullDoc.chunks || fullDoc.chunks.length === 0)) {
          console.log(`No text or chunks found, skipping`);
          failCount++;
          continue;
        }

        // Use existing chunks if available, otherwise re-chunk the text
        let chunks;
        if (fullDoc.chunks && fullDoc.chunks.length > 0) {
          chunks = fullDoc.chunks;
          console.log(`Using ${chunks.length} existing chunks`);
        } else {
          chunks = chunkText(fullDoc.extractedText, RAG_CONFIG.CHUNK_SIZE, RAG_CONFIG.CHUNK_OVERLAP);
          console.log(`Re-chunked text into ${chunks.length} chunks`);
        }

        if (chunks.length === 0) {
          console.log(`No chunks produced, skipping`);
          failCount++;
          continue;
        }

        if (DRY_RUN) {
          console.log(`Would create ${chunks.length} chunks with embeddings`);
          successCount++;
          continue;
        }

        // Generate embeddings
        const chunkTexts = chunks.map(c => c.content);
        const embeddings = await generateEmbeddings(chunkTexts);

        if (embeddings.length !== chunks.length) {
          console.log(`Embedding count mismatch (${embeddings.length} vs ${chunks.length})`);
          failCount++;
          continue;
        }

        // Build DocumentChunk records
        const chunkRecords = chunks.map((chunk, idx) => ({
          documentId: doc._id,
          userId: doc.userId,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber || 0,
          wordCount: chunk.content.split(/\s+/).length,
          embedding: embeddings[idx],
        }));

        // Insert all at once
        await DocumentChunk.insertMany(chunkRecords);

        console.log(` Migrated: ${chunks.length} chunks with embeddings`);
        successCount++;

        // Small delay between documents to avoid rate limits
        if (i + batch.indexOf(doc) + 1 < docsNeedingMigration.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(` Failed to migrate "${doc.title}":`, error.message);
        failCount++;
      }
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed:  ${failCount}`);
  console.log(`Total:   ${docsNeedingMigration.length}`);

  await mongoose.disconnect();
  console.log('Database disconnected');
};

migrateDocuments().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
