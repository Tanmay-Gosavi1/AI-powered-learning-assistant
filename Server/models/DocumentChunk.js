import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  pageNumber: {
    type: Number,
    default: 0,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  embedding: {
    type: [Number],
    default: undefined, // Only set after embedding generation
  },
}, { timestamps: true });

// Compound index for fast document-scoped ordered retrieval
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });

// Index for user-scoped queries (e.g., migration, cleanup)
documentChunkSchema.index({ userId: 1 });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

export default DocumentChunk;
