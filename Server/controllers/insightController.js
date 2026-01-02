import AiInsight from "../models/AiInsight.js";
import Document from "../models/Document.js";

export const createInsight = async (req, res, next) => {
  try {
    const { documentId, type, title, content } = req.body;
    if (!documentId || !type || !title || !content) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields", statusCode: 400 });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found", statusCode: 404 });
    }

    const insight = await AiInsight.create({
      userId: req.user.id,
      documentId,
      type,
      title: title.trim(),
      content,
    });

    return res.status(201).json({ success: true, data: insight, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

export const getInsightsByDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    if (!documentId) {
      return res
        .status(400)
        .json({ success: false, error: "Document ID is required", statusCode: 400 });
    }
    const insights = await AiInsight.find({
      userId: req.user.id,
      documentId,
    }).sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, data: insights, count: insights.length, statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const updateInsightTitle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required", statusCode: 400 });
    }

    const insight = await AiInsight.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { title: title.trim() } },
      { new: true }
    );

    if (!insight) {
      return res
        .status(404)
        .json({ success: false, error: "Insight not found", statusCode: 404 });
    }

    return res.status(200).json({ success: true, data: insight, statusCode: 200 });
  } catch (error) {
    next(error);
  }
};
