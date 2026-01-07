import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import uploadToCloudinary from '../utils/imageUpload.js';
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

    // 🔥 Save temp path BEFORE upload deletes it
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

    // Process PDF asynchronously using saved temp path
    processPDF(doc._id, tempPath).catch((err) => {
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


// Helper function
const processPDF = async (docId , filePath) => {
    try {
        const {text} = await extractTextFromPDF(filePath);
        const chunks = chunkText(text , 500 , 50);

        await Document.findByIdAndUpdate(docId , 
            {
                extractedText : text,
                chunks : chunks,
                status : 'ready'
            }
        )
        console.log(`Document ${docId} processed successfully.`);
    } catch (error) {
        console.error(`Error processing document ${docId} : ` , error);
        await Document.findByIdAndUpdate(docId , {status : 'failed'});
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

        // Delete from Cloudinary
        try {
            // Extract public_id from Cloudinary URL
            // Example: https://res.cloudinary.com/xxx/raw/upload/fl_attachment:false/v123456/folder/filename.pdf
            const urlParts = doc.filePath.split('/upload/');
            if (urlParts.length > 1) {
                // Get everything after upload/ and remove any transformation flags
                let pathAfterUpload = urlParts[1];
                // Remove flags like fl_attachment:false/
                pathAfterUpload = pathAfterUpload.replace(/^fl_[^/]+\//, '');
                // Remove version
                pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
                // Remove .pdf extension for public_id
                const publicId = pathAfterUpload.replace(/\.[^.]+$/, '');
                
                await cloudinary.uploader.destroy(publicId, { 
                    resource_type: 'raw',
                    invalidate: true 
                });
                console.log(`Deleted from Cloudinary: ${publicId}`);
            }
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with document deletion even if Cloudinary delete fails
        }

        await doc.deleteOne();

        res.status(200).json({success : true , message : "Document deleted successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}