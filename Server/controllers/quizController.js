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

        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user.id });
        if (!quiz) {
            return res.status(404).json({ success: false, error: "Quiz not found", statusCode: 404 });
        }

        // Allow re-submission to support retakes by overwriting prior attempt

        // Normalize incoming answers
        let normalized = [];
        if (Array.isArray(answers)) {
            normalized = answers.map(a => ({
                questionIndex: a.questionIndex,
                // Accept either string option or index under selectedAnswer
                selectedOption: typeof a.selectedAnswer === 'number'
                    ? (quiz.questions[a.questionIndex]?.options?.[a.selectedAnswer])
                    : (a.selectedOption ?? a.selectedAnswer)
            }));
        } else if (answers && typeof answers === 'object') {
            // Accept object map of questionId -> optionIndex
            normalized = Object.entries(answers).map(([questionId, optIndex]) => {
                const idx = quiz.questions.findIndex(q => q._id.toString() === String(questionId));
                const selectedOption = idx >= 0 ? quiz.questions[idx]?.options?.[optIndex] : undefined;
                return { questionIndex: idx, selectedOption };
            });
        }

        if (!Array.isArray(normalized) || normalized.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid answers payload", statusCode: 400 });
        }

        let correctCount = 0;
        const userAnswers = [];

        normalized.forEach(({ questionIndex, selectedOption }) => {
            if (typeof questionIndex === 'number' && questionIndex >= 0 && questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                const isCorrect = selectedOption === question.correctAnswer;
                if (isCorrect) correctCount++;
                userAnswers.push({
                    questionId: questionIndex,
                    selectedOption,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        quiz.userAnswers = userAnswers;
        quiz.totalQuestions = quiz.questions.length;
        quiz.score = Math.round((correctCount / Math.max(quiz.totalQuestions, 1)) * 100);
        quiz.completedAt = new Date();
        await quiz.save();

        return res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score: quiz.score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: quiz.score,
                userAnswers
            },
            message: "Quiz submitted successfully!!"
        });
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
            const userAnswer = quiz.userAnswers.find(ans => ans.questionId === index);
            const selectedOption = userAnswer?.selectedOption ?? null;
            return {
                question: question.question,
                questionIndex: index,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedOption,
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