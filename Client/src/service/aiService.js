import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const generateFlashcards = async (docId , options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS , { documentId: docId , ...options });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while generating flashcards.'  };
    }
}

const generateQuiz = async (docId , options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ , { documentId: docId , ...options });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while generating quiz.'  };
    }
}

const generateSummary = async (docId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY , { documentId: docId });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while generating summary.'  };
    }
}

const chat = async (docId, message, mode = 'hybrid') => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.CHAT, { documentId: docId, question: message, mode });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while chatting with AI.' };
    }
}

const explainConcept = async (docId , concept) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT , { documentId: docId , concept });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while explaining the concept.'  };
    }   
}

const getChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while fetching chat history.'  };
    }
}

const clearChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.AI.CLEAR_CHAT_HISTORY(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while clearing chat history.' };
    }
}

const aiService = {
    generateFlashcards,
    generateQuiz,
    generateSummary, 
    chat,
    explainConcept,
    getChatHistory,
    clearChatHistory
};

export default aiService;