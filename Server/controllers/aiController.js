import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
// Legacy keyword fallback intentionally disabled for vector-only testing.
// import { findReleventChunks } from '../utils/textChunker.js';
import { retrieveRelevantChunks } from '../utils/ragService.js';
import { getEducationalContent, getEducationalContentBatches } from '../utils/chunkFilterService.js';
import * as geminiService from '../utils/geminiService.js';

/**
 * Get chunk-based educational content for a document.
 * Uses DocumentChunk collection if available, falls back to extractedText.
 *
 * @param {string} documentId
 * @param {number} maxChars - Character budget
 * @returns {Promise<string>} - Filtered educational text
 */
const getDocumentContent = async (documentId, maxChars = 15000) => {
    const chunks = await DocumentChunk.find({ documentId })
        .select('content chunkIndex')
        .sort({ chunkIndex: 1 })
        .lean();

    if (chunks.length > 0) {
        return getEducationalContent(chunks, maxChars);
    }

    // Fallback for old documents without DocumentChunk records
    const doc = await Document.findById(documentId).select('extractedText').lean();
    return doc?.extractedText?.substring(0, maxChars) || '';
};

/**
 * Get chunk-based educational content in batches for a document.
 * Used for thorough generation across the whole document.
 *
 * @param {string} documentId
 * @param {number} batchCharSize
 * @returns {Promise<string[]>}
 */
const getDocumentContentBatches = async (documentId, batchCharSize = 10000) => {
    const chunks = await DocumentChunk.find({ documentId })
        .select('content chunkIndex')
        .sort({ chunkIndex: 1 })
        .lean();

    if (chunks.length > 0) {
        return getEducationalContentBatches(chunks, batchCharSize);
    }

    // Fallback: single batch from extractedText
    const doc = await Document.findById(documentId).select('extractedText').lean();
    const text = doc?.extractedText || '';
    return text.length > 0 ? [text.substring(0, batchCharSize)] : [];
};

export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count=10, mode='overwrite' } = req.body;
        if(!documentId) {
            return res.status(400).json({success: false, error: "Document ID is required", statusCode: 400});
        }

        const document = await Document.findOne({_id: documentId, userId: req.user.id , status : 'ready'});

        if(!document) {
            return res.status(404).json({success: false, error: "Document not found or not processed yet", statusCode: 404});
        }

        // Use chunk-based educational content instead of raw extractedText
        // Process in batches to cover the whole document, not just the first 15k chars
        const batches = await getDocumentContentBatches(documentId, 12000);
        const cardsPerBatch = batches.length > 1
            ? Math.ceil(parseInt(count) / batches.length)
            : parseInt(count);

        let allCards = [];
        for (const batchText of batches) {
            if (batchText.trim().length === 0) continue;
            try {
                const cards = await geminiService.generateFlashcards(batchText, cardsPerBatch);
                allCards.push(...cards);
            } catch (batchError) {
                console.error('Flashcard batch generation error:', batchError.message);
                // Continue with other batches even if one fails
            }
        }

        // Trim to requested count
        allCards = allCards.slice(0, parseInt(count));

        if (allCards.length === 0) {
            return res.status(500).json({success: false, error: "Failed to generate flashcards from document content", statusCode: 500});
        }

        const mapped = allCards.map(card => ({
            question: card.question,
            answer: card.answer,
            difficulty: card.difficulty,
            reviewCount: 0,
            isStarred: false
        }));

        let flashcardSet;
        if (mode === 'append') {
            flashcardSet = await Flashcard.findOneAndUpdate(
                { userId: req.user.id, documentId: document._id },
                { $push: { cards: { $each: mapped } }, $set: { updatedAt: new Date() } },
                { new: true, upsert: true }
            );
        } else {
            // overwrite (default)
            flashcardSet = await Flashcard.findOneAndUpdate(
                { userId: req.user.id, documentId: document._id },
                { $set: { cards: mapped, updatedAt: new Date() } },
                { new: true, upsert: true }
            );
        }

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: mode === 'append' ? 'Flashcards appended successfully' : 'Flashcards generated successfully'
        });        
    } catch (error) {
        next(error);
    }
}

export const generateQuiz = async (req, res, next) => {
    try {
        const {documentId , numQuestions=5 , title} = req.body;

        if(!documentId) {
            return res.status(400).json({success: false, error: "Document ID is required", statusCode: 400});
        }
        const document = await Document.findOne({_id: documentId, userId: req.user.id , status : 'ready'});

        if(!document) {
            return res.status(404).json({success: false, error: "Document not found or not processed yet", statusCode: 404});
        }

        // Use chunk-based educational content in batches
        const batches = await getDocumentContentBatches(documentId, 12000);
        const questionsPerBatch = batches.length > 1
            ? Math.ceil(parseInt(numQuestions) / batches.length)
            : parseInt(numQuestions);

        let allQuestions = [];
        for (const batchText of batches) {
            if (batchText.trim().length === 0) continue;
            try {
                const questions = await geminiService.generateQuiz(batchText, questionsPerBatch);
                allQuestions.push(...questions);
            } catch (batchError) {
                console.error('Quiz batch generation error:', batchError.message);
            }
        }

        allQuestions = allQuestions.slice(0, parseInt(numQuestions));

        if (allQuestions.length === 0) {
            return res.status(500).json({success: false, error: "Failed to generate quiz from document content", statusCode: 500});
        }

        // Store the quiz in the database.
        const quiz = await Quiz.create({
            userId: req.user.id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: allQuestions,
            totalQuestions: allQuestions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });

    } catch (error) {
        next(error);
    }
}

export const generateSummary = async (req, res, next) => {
    try {
        const {documentId , numQuestions=5 , title} = req.body;

        if(!documentId) {
            return res.status(400).json({success: false, error: "Document ID is required", statusCode: 400});
        }
        const document = await Document.findOne({_id: documentId, userId: req.user.id , status : 'ready'});

        if(!document) {
            return res.status(404).json({success: false, error: "Document not found or not processed yet", statusCode: 404});
        }

        // Use chunk-based educational content (single concatenated text)
        const educationalText = await getDocumentContent(documentId, 20000);

        if (!educationalText || educationalText.trim().length === 0) {
            return res.status(500).json({success: false, error: "No content available for summary", statusCode: 500});
        }

        const summary = await geminiService.generateSummary(educationalText);
        
        res.status(200).json({success: true, data: {
            documentId: document._id,
            title: document.title,
            summary: summary
        }, message: "Summary generated successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const chat = async (req, res, next) => {
    try {
        const {documentId, question, mode = 'hybrid'} = req.body;

        if(!documentId || !question) {
            return res.status(400).json({success: false, error: "Document ID and question are required", statusCode: 400});
        }
        const document = await Document.findOne({_id: documentId, userId: req.user.id , status : 'ready'});

        if(!document) {
            return res.status(404).json({success: false, error: "Document not found or not processed yet", statusCode: 404});
        }

        // Semantic retrieval: vector search only for production testing.
        let relevantChunks = [];
        const hasVectorChunks = await DocumentChunk.countDocuments({ documentId: document._id });

        if (hasVectorChunks > 0) {
            // New semantic retrieval path
            relevantChunks = await retrieveRelevantChunks({
                documentId: document._id.toString(),
                query: question,
            });
        } else {
            // Legacy keyword fallback intentionally disabled for vector-only testing.
            // console.log('[RAG] Falling back to keyword-based retrieval (no vector chunks found)');
            // relevantChunks = findReleventChunks(document.chunks, question, 3);
            console.log('[RAG] No vector chunks found; keyword fallback disabled for vector-only mode');
        }

        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        // Reuse existing chat history or create a new one.
        let chatHistory = await ChatHistory.findOne({
            userId: req.user.id,
            documentId: document._id
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user.id,
                documentId: document._id,
                messages: []
            });
        }

        const answer = await geminiService.chatWithContext(question, relevantChunks, mode)

        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            },
            {
                role : "assistant",
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        )

        await chatHistory.save();
        
        res.status(200).json({success: true, 
            data: {
                question: question,
                answer: answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            }
            , message: "Chat response generated successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const explainConcept = async (req, res, next) => {
    try {
        const {documentId, concept} = req.body;

        if(!documentId || !concept) {
            return res.status(400).json({success: false, error: "Document ID and concept are required", statusCode: 400});
        }
        const document = await Document.findOne({_id: documentId, userId: req.user.id , status : 'ready'});

        if(!document) {
            return res.status(404).json({success: false, error: "Document not found or not processed yet", statusCode: 404});
        }

        // Semantic retrieval: vector search only for production testing.
        let relevantChunks = [];
        const hasVectorChunks = await DocumentChunk.countDocuments({ documentId: document._id });

        if (hasVectorChunks > 0) {
            relevantChunks = await retrieveRelevantChunks({
                documentId: document._id.toString(),
                query: concept,
            });
        } else {
            // Legacy keyword fallback intentionally disabled for vector-only testing.
            // console.log('[RAG] Falling back to keyword-based retrieval for explainConcept');
            // relevantChunks = findReleventChunks(document.chunks, concept, 3);
            console.log('[RAG] No vector chunks found; keyword fallback disabled for vector-only mode');
        }

        const context = relevantChunks.map(c => c.content).join('\n\n');

        const explanation = await geminiService.explainConcept(concept, context);
        
        res.status(200).json({success: true, data: {
            concept: concept,
            explanation: explanation,
            relevantChunks: relevantChunks.map(c => c.chunkIndex)
        }, message: "Concept explained successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        if(!documentId) {
            return res.status(400).json({success: false, error: "Document ID is required", statusCode: 400});
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user.id,
            documentId: documentId
        }).select('messages')

        if(!chatHistory){
            return res.status(200).json({success: true, data: [], message: "No history found for these document.", statusCode: 200});
        }
        
        res.status(200).json({success: true, data: chatHistory.messages, message: "Chat history fetched successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const clearChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        if(!documentId) {
            return res.status(400).json({success: false, error: "Document ID is required", statusCode: 400});
        }

        const result = await ChatHistory.findOneAndDelete({
            userId: req.user.id,
            documentId: documentId
        });

        if(!result){
            return res.status(200).json({success: true, message: "No chat history to clear.", statusCode: 200});
        }
        
        res.status(200).json({success: true, message: "Chat history cleared successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}