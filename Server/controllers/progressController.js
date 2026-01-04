import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

// Helper function to check if two dates are on the same day
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Helper function to check if date1 is exactly one day before date2
const isYesterday = (date1, date2) => {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
};

// Function to calculate and update study streak
const calculateStudyStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
  
  if (!lastStudy) {
    // First time studying
    return 0;
  }

  lastStudy.setHours(0, 0, 0, 0);

  if (isSameDay(lastStudy, today)) {
    // Already studied today, return current streak
    return user.studyStreak;
  } else if (isYesterday(lastStudy, today)) {
    // Studied yesterday, streak continues
    return user.studyStreak;
  } else {
    // Streak broken - more than 1 day gap
    await User.findByIdAndUpdate(userId, { studyStreak: 0 });
    return 0;
  }
};

// Function to update streak when user studies
export const updateStudyStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;

  if (!lastStudy) {
    // First time studying
    await User.findByIdAndUpdate(userId, {
      lastStudyDate: new Date(),
      studyStreak: 1
    });
    return 1;
  }

  lastStudy.setHours(0, 0, 0, 0);

  if (isSameDay(lastStudy, today)) {
    // Already studied today, don't increment
    return user.studyStreak;
  } else if (isYesterday(lastStudy, today)) {
    // Studied yesterday, increment streak
    const newStreak = user.studyStreak + 1;
    await User.findByIdAndUpdate(userId, {
      lastStudyDate: new Date(),
      studyStreak: newStreak
    });
    return newStreak;
  } else {
    // Streak broken, start fresh
    await User.findByIdAndUpdate(userId, {
      lastStudyDate: new Date(),
      studyStreak: 1
    });
    return 1;
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get counts
    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null }
    });

    // Get flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach(set => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter(c => c.isStarred).length;
    });

    // Get quiz statistics
    const quizzes = await Quiz.find({
      userId,
      completedAt: { $ne: null }
    });

    const averageScore = quizzes.length > 0
      ? Math.round(
          quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
        )
      : 0;

    // Recent activity
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select('title fileName lastAccessed status')

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('documentId', 'title')
      .select('title score totalQuestions completedAt createdAt updatedAt');

    // Calculate study streak
    const studyStreak = await calculateStudyStreak(userId); 

    return res.status(200).json({
      success: true,
      data: {
        overview: {
            totalDocuments,
            totalFlashcardSets,
            totalQuizzes,
            totalFlashcards,
            reviewedFlashcards,
            starredFlashcards,
            completedQuizzes,
            averageScore,
            studyStreak 
        },
        recentActivity: {
            documents: recentDocuments,
            quizzes: recentQuizzes
        }
      } ,
      message: 'Dashboard data fetched successfully',
      statusCode: 200
    });
  } catch (error) {
    next(error);
  }  
}