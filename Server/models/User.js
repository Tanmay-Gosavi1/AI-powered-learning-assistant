import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
    },
    profileImg : {
        type: String,
        default : null
    },
    lastStudyDate : {
        type: Date,
        default: null
    },
    studyStreak : {
        type: Number,
        default: 0
    }
}, { timestamps: true });    

// const comparePassword = function(enteredPassword) {
//     return enteredPassword === this.password;
// }

// userSchema.methods.comparePassword = comparePassword;

const User = mongoose.model('User', userSchema);

export default User;