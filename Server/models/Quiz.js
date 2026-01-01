import { mongoose } from "mongoose";
import { trim } from "zod";
import { de } from "zod/v4/locales";

const quizSchema = new mongoose.Schema({
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
    title : {
        type : String,
        required : true,
        trim: true
    },
    questions : [{
        question : {
            type : String,
            required : true,
            trim: true
        },
        options : {
            type : [String],
            required : true,
            validate : [array => array.length === 4, 'Options must contain exactly 4 items']
        },
        correctAnswer : {
            type : String,
            required : true,
            trim: true
        },
        explanation : {
            type : String,
            default : "",
            trim: true
        },
        difficulty : {
            type : String,
            enum : ['easy', 'medium', 'hard'],
            default : 'medium'
        }
    }],
    userAnswers : [{
        questionId : {
            type : Number ,
            required : true
        },
        selectedOption : {
            type : String,
            required : true,
            trim: true
        },
        isCorrect : {
            type : Boolean,
            required : true
        },
        answeredAt : {
            type : Date,
            default : Date.now
        }
    }],
    score : {
        type : Number,
        default : 0
    },
    totalQuestions : {
        type : Number,
        required : true
    },
    completedAt : {
        type : Date,
        dafault : null
    }
},{timestamps: true})

// Index for faster queries on userId and documentId
quizSchema.index({ userId: 1, documentId: 1 }); 

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;