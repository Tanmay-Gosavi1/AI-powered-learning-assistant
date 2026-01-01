import Quiz from '../models/Quiz.js';

export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({ documentId : req.params.documentId , userId : req.user.id })
                                .populate('documentId', 'title fileName')
                                .sort({ createdAt : -1 });

        res.status(200).json({success: true, data: quizzes, count : quizzes.length, message: "Quizzes fetched successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({ _id : req.params.id , userId : req.user.id })

        if(!quiz){
            return res.status(404).json({success : false , error : "Quiz not found", statusCode: 404})
        }

        res.status(200).json({success: true, data: quiz, message: "Quiz fetched successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if(!Array.isArray(answers)){
            return res.status(400).json({success : false , error : "Answers must be an array", statusCode: 400})
        }

        const quiz = await Quiz.findOne({ _id : req.params.id , userId : req.user.id });
        if(!quiz){
            return res.status(404).json({success : false , error : "Quiz not found", statusCode: 404})
        }

        if(quiz.completedAt){
            return res.status(400).json({success : false , error : "Quiz already submitted", statusCode: 400})
        }

        let correctCount = 0 ;
        const userAnswers = [] ;

        answers.forEach(answer => {
            const {questionIndex , selectedAnswer} = answer;
            if(questionIndex < quiz.questions.length){
                const question = quiz.questions[questionIndex]
                const isCorrect = selectedAnswer === quiz.correctAnswer

                if(isCorrect) correctCount++ ;

                userAnswers.push({
                    questionIndex ,
                    selectedAnswer,
                    isCorrect ,
                    answeredAt : new Date()
                })
            }
        })

        const score = Math.round((correctCount / quiz.totalQuestion)*100)

        return res.status(200).json({success : true , data : {
            quizId : quiz._id ,
            score , 
            correctCount ,
            totalQuestion : quiz.totalQuestion ,
            percentage : score ,
            userAnswers
        } , message : "Quiz submitted successfully!!"});
    } catch (error) {
        next(error);
    }
}
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({ _id : req.params.id , userId : req.user.id });
        if(!quiz){
            return res.status(404).json({success : false , error : "Quiz not found", statusCode: 404})
        }

        if(!quiz.completedAt){
            return res.status(400).json({success : false , error : "Quiz not yet submitted", statusCode: 400})
        }

        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(ans => ans.questionIndex === index);

            return {
                question: question.question,
                questionIndex: index,
                options : question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation,
            }
        });

        return res.status(200).json({success : true , 
            data : {
                quiz : {
                    id : quiz._id ,
                    title : quiz.title ,
                    document : quiz.documentId ,
                    score : quiz.score ,
                    totalQuestions : quiz.totalQuestions ,
                    completedAt : quiz.completedAt
                },
                results : detailedResults
            } , 
            message : "Quiz results fetched successfully!!"
        });
    } catch (error) {
        next(error);
    }
}
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOneAndDelete({ _id : req.params.id , userId : req.user.id });
        if(!quiz){
            return res.status(404).json({success : false , error : "Quiz not found", statusCode: 404})
        }
        await quiz.deleteOne()

        res.status(200).json({success : true , message : "Quiz deleted successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}