import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getAllFlashcardSets = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while fetching flashcard sets.' };
    }
};

const getFlashcardsForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while fetching flashcards for document.' };
    }
};

const reviewFlashcard = async (cardId, reviewData) => {
    try {
        const response = await axiosInstance.post(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId), reviewData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while reviewing flashcard.' };
    }
};

const toggleStarFlashcard = async (cardId) => {
    try {
        const response = await axiosInstance.patch(API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while toggling flashcard star.' };
    }
};

const deleteFlashcardSet = async (setId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(setId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while deleting flashcard set.' };
    }
};

const flashcardService = {
    getAllFlashcardSets,
    getFlashcardsForDocument,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet
};

export default flashcardService;