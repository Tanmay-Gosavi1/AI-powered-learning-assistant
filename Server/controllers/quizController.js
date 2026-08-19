import Quiz from '../models/Quiz.js';
import { updateStudyStreak } from './progressController.js';

const resolveOptionText = (question, answer) => {
    if (!question?.options || answer === null || answer === undefined) return undefined;

    if (typeof answer === 'number' && Number.isInteger(answer)) {
        return question.options[answer];
    }

    const normalizedAnswer = String(answer).trim();
    const optionIndexMatch = normalizedAnswer.match(/^(?:option|o)?\s*([1-4])$/i);
    if (optionIndexMatch) {
        return question.options[Number(optionIndexMatch[1]) - 1];
    }

    return question.options.find(option => option.trim() === normalizedAnswer) || normalizedAnswer;
};

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

        // Allow resubmission so users can retake the quiz.

        // Normalize incoming answers.
        let normalized = [];
        if (Array.isArray(answers)) {
            normalized = answers.map(a => ({
                questionIndex: a.questionIndex,
                selectedOption: resolveOptionText(
                    quiz.questions[a.questionIndex],
                    a.selectedOption ?? a.selectedAnswer
                )
            }));
        } else if (answers && typeof answers === 'object') {
            normalized = Object.entries(answers).map(([questionId, optIndex]) => {
                const idx = quiz.questions.findIndex(q => q._id.toString() === String(questionId));
                const selectedOption = idx >= 0
                    ? resolveOptionText(quiz.questions[idx], optIndex)
                    : undefined;
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
                const correctAnswer = resolveOptionText(question, question.correctAnswer);
                const isCorrect = selectedOption === correctAnswer;
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

        // Update the study streak after quiz completion.
        await updateStudyStreak(req.user.id);

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
            const correctAnswer = resolveOptionText(question, question.correctAnswer);
            const selectedOption = userAnswer
                ? resolveOptionText(question, userAnswer.selectedOption)
                : null;
            return {
                question: question.question,
                questionIndex: index,
                options: question.options,
                correctAnswer,
                selectedOption,
                isCorrect: selectedOption !== null && selectedOption === correctAnswer,
                explanation: question.explanation,
            }
        });

        const correctCount = detailedResults.filter(result => result.isCorrect).length;
        const score = Math.round((correctCount / Math.max(quiz.totalQuestions, 1)) * 100);

        return res.status(200).json({success : true , 
            data : {
                quiz : {
                    id : quiz._id ,
                    title : quiz.title ,
                    document : quiz.documentId ,
                    score,
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