import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import { generateEmbeddings } from '../utils/embeddingService.js';
import uploadToCloudinary from '../utils/imageUpload.js';
import { RAG_CONFIG } from '../config/ragConfig.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

export const uploadDoc = async (req, res, next) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400
      });
    }

    const file = req.files.document;
    const { title } = req.body;

    // Validate file type
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        error: "Only PDF files are allowed",
        statusCode: 400
      });
    }

    // Validate file size (10MB)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: "File size exceeds limit of 10MB",
        statusCode: 400
      });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide a title for the document",
        statusCode: 400
      });
    }

    // Keep the temporary file path before upload cleanup removes it.
    const tempPath = file.tempFilePath;

    // Upload to Cloudinary (raw)
    const result = await uploadToCloudinary(
      file,
      "learning-assistant/documents"
    );

    const doc = await Document.create({
      userId: req.user.id,
      title: title.trim(),
      fileName: file.name,
      filePath: result.secure_url,
      fileSize: file.size,
      status: "processing"
    });

    // Process the PDF after upload using the saved temp path.
    processPDF(doc._id, doc.userId, tempPath).catch((err) => {
      console.error("Error processing PDF:", err);
    });

    return res.status(201).json({
      success: true,
      data: doc,
      message: "Document uploaded successfully",
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};


// Process a PDF document after upload.
// Now generates embeddings and stores chunks in the DocumentChunk collection.
const processPDF = async (docId, userId, filePath) => {
    try {
        const {text} = await extractTextFromPDF(filePath);

        if (!text || text.trim().length === 0) {
            console.error(`Document ${docId}: No text extracted from PDF`);
            await Document.findByIdAndUpdate(docId, { status: 'failed' });
            return;
        }

        const chunks = chunkText(text, RAG_CONFIG.CHUNK_SIZE, RAG_CONFIG.CHUNK_OVERLAP);

        if (chunks.length === 0) {
            console.error(`Document ${docId}: No chunks produced from extracted text`);
            await Document.findByIdAndUpdate(docId, { status: 'failed' });
            return;
        }

        console.log(`[Processing] Document ${docId}: ${chunks.length} chunks created, generating embeddings...`);

        // Generate embeddings for all chunks in batches
        const chunkTexts = chunks.map(c => c.content);
        let embeddings;
        try {
            embeddings = await generateEmbeddings(chunkTexts);
        } catch (embeddingError) {
            console.error(`Document ${docId}: Embedding generation failed:`, embeddingError.message);
            await Document.findByIdAndUpdate(docId, { status: 'failed' });
            return;
        }

        if (embeddings.length !== chunks.length) {
            console.error(`Document ${docId}: Embedding count mismatch (${embeddings.length} vs ${chunks.length} chunks)`);
            await Document.findByIdAndUpdate(docId, { status: 'failed' });
            return;
        }

        // Build DocumentChunk records
        const chunkRecords = chunks.map((chunk, i) => ({
            documentId: docId,
            userId: userId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            wordCount: chunk.content.split(/\s+/).length,
            embedding: embeddings[i],
        }));

        // Insert all chunks into the DocumentChunk collection
        await DocumentChunk.insertMany(chunkRecords);

        // Update the document — keep extractedText (used by flashcards/quizzes/summaries),
        // store the old chunks array for backward compatibility, and record the chunk count
        await Document.findByIdAndUpdate(docId, {
            extractedText: text,
            chunks: chunks, // Keep for backward compat / fallback
            chunkCount: chunks.length,
            status: 'ready'
        });

        console.log(`[Processing] Document ${docId} processed successfully: ${chunks.length} chunks with embeddings stored.`);
    } catch (error) {
        console.error(`Error processing document ${docId}:`, error);
        await Document.findByIdAndUpdate(docId, { status: 'failed' });
    }
}

export const getDocs = async (req, res , next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match : { userId : new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $lookup : {
                    from : 'flashcards',
                    localField : '_id',
                    foreignField : 'documentId',
                    as : 'flashcardSets'
                }
            }, 
            {
                $lookup : {
                    from : 'quizzes',
                    localField : '_id',
                    foreignField : 'documentId',
                    as : 'quizzes'
                }
            },    
            {
                $addFields : {
                    flashcardCount : { $size : "$flashcardSets" },
                    quizCount : { $size : "$quizzes" }
                }
            },
            { 
                $project : {
                    extractedText : 0,
                    textChunks : 0,
                    flashcardSets : 0,
                    quizzes : 0
                }
            },
            {
                $sort : { uploadDate : -1 }
            }
        ])

        res.status(200).json({success : true , data : documents , count : documents.length ,message : "Documents fetched successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const getDoc = async (req, res , next) => {
    try {
        const doc = await Document.findOne({ _id : req.params.id , userId : req.user.id });
        if(!doc){
            return res.status(404).json({success : false , error : "Document not found", statusCode: 404})
        }

        const flashcardCount = await Flashcard.countDocuments({ documentId : doc._id , userId : req.user.id });
        const quizCount = await Quiz.countDocuments({ documentId : doc._id , userId : req.user.id });

        doc.lastAccessed = Date.now();
        await doc.save();

        const docData = doc.toObject();
        docData.flashcardCount = flashcardCount;
        docData.quizCount = quizCount;
        res.status(200).json({success : true , data : docData , message : "Document fetched successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const deleteDoc = async (req, res, next) => {
    try {
        const doc = await Document.findOne({ _id : req.params.id , userId : req.user.id });
        if(!doc){
            return res.status(404).json({success : false , error : "Document not found", statusCode: 404})
        }

        // Remove the document from Cloudinary if possible.
        try {
            // Extract the public ID from the Cloudinary URL.
            const urlParts = doc.filePath.split('/upload/');
            if (urlParts.length > 1) {
                let pathAfterUpload = urlParts[1];
                pathAfterUpload = pathAfterUpload.replace(/^fl_[^/]+\//, '');
                pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
                const publicId = pathAfterUpload.replace(/\.[^.]+$/, '');
                
                await cloudinary.uploader.destroy(publicId, { 
                    resource_type: 'raw',
                    invalidate: true 
                });
                console.log(`Deleted from Cloudinary: ${publicId}`);
            }
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue deleting the document record even if Cloudinary cleanup fails.
        }

        // Delete associated DocumentChunk records
        const deleteResult = await DocumentChunk.deleteMany({ documentId: doc._id });
        console.log(`Deleted ${deleteResult.deletedCount} chunks for document ${doc._id}`);

        await doc.deleteOne();

        res.status(200).json({success : true , message : "Document deleted successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}