import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises'
import mongoose from 'mongoose';

export const uploadDoc = async (req, res , next) => {
    try {
        if(!req.file){
            return res.status(400).json({success : false , error : "Please upload a PDF file", statusCode: 400})
        }

        const {title} = req.body;

        if(!title || title.trim().length === 0){
            // Clean up uploaded file
            await fs.unlink(req.file.path);
            return  res.status(400).json({success : false , error : "Please provide a title for the document", statusCode: 400})
        }

        // Construct Url for uploaded file 
        const baseUrl =  `http://localhost:${process.env.PORT || 8000}` 
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`

        const doc = await Document.create({
            userId : req.user.id,
            title : title.trim(),
            fileName : req.file.originalname,
            filePath : fileUrl ,
            fileSize : req.file.size,
            status : 'processing'
        })

        processPDF(doc._id , req.file.path).catch((err) => {
            console.error("Error processing PDF: " , err);
        })

        res.status(201).json({success : true , data : doc , message : "Document uploaded successfully", statusCode: 201});  
        
    }catch (error) {
        // Clean up uploaded file in case of error
        if(req.file){
            await fs.unlink(req.file.path).catch(console.error);
        }
        next(error);
    }
}

// Helper function
const processPDF = async (docId , filePath) => {
    try {
        const {text} = await extractTextFromPDF(filePath);
        const chunks = chunkText(text , 500 , 50);

        await Document.findByIdAndUpdate(docId , 
            {
                extractedText : text,
                textChunks : chunks,
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

export const deleteDoc = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id : req.params.id , userId : req.user.id });
        if(!doc){
            return res.status(404).json({success : false , error : "Document not found", statusCode: 404})
        }

        await fs.unlink(doc.filePath).catch(()=>{});

        await doc.deleteOne();

        res.status(200).json({success : true , message : "Document deleted successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}
