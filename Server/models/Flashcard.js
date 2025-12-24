import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
    userId : {
        type  : mongoose.Schema.Types.ObjectId,
        ref   : "User",
        required : true
    },
    documentId : {
        type  : mongoose.Schema.Types.ObjectId,
        ref   : "Document",
        required : true
    },
    cards : [{
        question : {
            type : String,
            required : true,
            trim: true
        },
        answer : {
            type : String,
            required : true,
            trim: true
        },
        difficulty : {
            type : String,
            enum : ['easy', 'medium', 'hard'],
            default : 'medium'
        },
        lastReviewed : {
            type : Date,
            default : null
        },
        reviewCount : {
            type : Number,
            default : 0
        },
        isStarred : {
            type : Boolean,
            default : false
        }
    }]
},{ timestamps : true });

flashcardSchema.index({ userId: 1, documentId: 1 }, { unique: true });

const FlashCard = mongoose.model("FlashCard", flashcardSchema);

export default FlashCard;