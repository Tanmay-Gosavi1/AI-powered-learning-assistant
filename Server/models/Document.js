import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    title : {
        type : String,
        required : [true , "Title is required"],
        trim : true,
    },
    status :{
        type : String,
        enum : ["processing" , "ready" , "failed"],
        default : "processing"
    },
    uploadDate : {
        type : Date,
        default : Date.now
    },
    lastAccessed : {
        type : Date,
        default : Date.now
    },
    fileName : {
        type : String,
        required : true
    },
    filePath : {
        type : String,
        required : true
    },
    fileSize : {
        type : Number,
        required : true
    },
    extractedText : {
        type : String,
        default : ""
    },
    chunks : [{
        content : {
            type : String,
            required : true
        },
        pageNumber : {
            type : Number,
            default : 0
        },
        chunkIndex : {
            type : Number,
            required : true
        }
    }]

},{ timestamps : true })

docSchema.index({userId : 1 , uploadDate : -1})

const Document = mongoose.model("Document", docSchema);

export default Document;