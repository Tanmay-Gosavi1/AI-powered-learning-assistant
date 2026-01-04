import Flashcard from '../models/Flashcard.js';
import Document from '../models/Document.js';

export const getFlashcards = async (req, res, next) => {
    try {
        // Logic to get flashcards for a specific document
        const flashcardSet = await Flashcard.findOne({ documentId: req.params.documentId, userId: req.user.id }).populate("documentId", "title fileName").sort({ createdAt: -1 });

        if (!flashcardSet) {
            return res.status(404).json({success: false, error: "Flashcard set not found", statusCode: 404});
        }

        res.status(200).json({success: true, data: flashcardSet, count : flashcardSet.length, message: "Flashcards fetched successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const getAllFlashcardSets = async (req, res, next) => {
    try {
        // Logic to get all flashcard sets for user
        const flashcardSets = await Flashcard.find({ userId: req.user.id }).populate('documentId', 'title').sort({ createdAt: -1 });

        res.status(200).json({success: true, data: flashcardSets, count: flashcardSets.length, message: "Flashcard sets fetched successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const toggleStarFlashcard = async (req, res, next) => {
    try {
        // Logic to toggle star status of flashcard
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user.id
        })
        
        if (!flashcardSet) {
            return res.status(404).json({success: false, error: "Flashcard set not found", statusCode: 404});
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if (cardIndex === -1) {
            return res.status(404).json({success: false, error: "Flashcard not found", statusCode: 404});
        }
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;
        await flashcardSet.save();

        res.status(200).json({success: true, data: flashcardSet, message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'}`, statusCode: 200});
    } catch (error) {
        next(error);
    }
}

export const deleteFlashcardSet = async (req, res, next) => {
    try {
        // Logic to delete flashcard set

        const flashcardSet = await Flashcard.findOne({ _id: req.params.id, userId: req.user.id });
        if (!flashcardSet) {
            return res.status(404).json({success: false, error: "Flashcard set not found", statusCode: 404});
        }
        await flashcardSet.deleteOne();
        
        res.status(200).json({success: true, message: "Flashcard set deleted successfully", statusCode: 200});
    } catch (error) {
        next(error);
    }
}