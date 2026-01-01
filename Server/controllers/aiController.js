import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import { findReleventChunks } from '../utils/textChunker.js';
import * as geminiService from '../utils/geminiService.js';

export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count=10 } = req.body;
        if(!documentId) {
            return res.status(400).json({success: false, error: "Document ID is required", statusCode: 400});
        }

        const document = await Document.findOne({_id: documentId, userId: req.user.id , status : 'ready'});

        if(!document) {
            return res.status(404).json({success: false, error: "Document not found or not processed yet", statusCode: 404});
        }
        // Generate flashcards using Gemini
        const cards = await geminiService.generateFlashcards(
        document.extractedText,
        parseInt(count)
        );

        // Save to database
        const flashcardSet = await Flashcard.create({
        userId: req.user.id,
        documentId: document._id,
        cards: cards.map(card => ({
            question: card.question,
            answer: card.answer,
            difficulty: card.difficulty,
            reviewCount: 0,
            isStarred: false
        }))
        });

        res.status(201).json({
        success: true,
        data: flashcardSet,
        message: 'Flashcards generated successfully'
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

        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // Save to database
        const quiz = await Quiz.create({
            userId: req.user.id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
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

        const summary = await geminiService.generateSummary(document.extractedText);
        
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
        const {documentId, question} = req.body;

        if(!documentId || !question) {
            return res.status(400).json({success: false, error: "Document ID and question are required", statusCode: 400});
        }
        const document = await Document.findOne({_id: documentId, userId: req.user.id , status : 'ready'});

        if(!document) {
            return res.status(404).json({success: false, error: "Document not found or not processed yet", statusCode: 404});
        }

        const relevantChunks = findReleventChunks(document.chunks, question , 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        // Find existing chat history or create new one
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

        const answer = await geminiService.chatWithContext(question , relevantChunks)

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
        const relevantChunks = findReleventChunks(document.chunks, concept , 3);
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