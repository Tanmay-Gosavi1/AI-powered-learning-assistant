import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["summary", "explain"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

aiInsightSchema.index({ userId: 1, documentId: 1, createdAt: -1 });

const AiInsight = mongoose.model("AiInsight", aiInsightSchema);
export default AiInsight;
