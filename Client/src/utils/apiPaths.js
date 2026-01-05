export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  DOCUMENTS: {
    UPLOAD: "/api/docs/upload",
    GET_DOCUMENTS: "/api/docs",
    GET_DOCUMENT_BY_ID: (id) => `/api/docs/${id}`,
    UPDATE_DOCUMENT: (id) => `/api/docs/${id}`,
    DELETE_DOCUMENT: (id) => `/api/docs/${id}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
    GENERATE_QUIZ: "/api/ai/generate-quiz",
    GENERATE_SUMMARY: "/api/ai/generate-summary",
    CHAT: "/api/ai/chat",
    EXPLAIN_CONCEPT: "/api/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId) =>
      `/api/ai/chat-history/${documentId}`,
    CLEAR_CHAT_HISTORY: (documentId) =>
      `/api/ai/chat-history/${documentId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/api/flashcards",
    GET_FLASHCARDS_FOR_DOC: (documentId) =>
      `/api/flashcards/${documentId}`,
    TOGGLE_STAR: (cardId) =>
      `/api/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (setId) =>
      `/api/flashcards/${setId}`,
  },

  QUIZZES :{
    GET_QUIZZES_FOR_DOC: (documentId) =>
      `/api/quiz/doc/${documentId}`,
    SUBMIT_QUIZ: (quizId) =>
      `/api/quiz/${quizId}/submit`,
    GET_QUIZ_BY_ID: (quizId) =>
      `/api/quiz/${quizId}`,
    GET_QUIZ_RESULTS: (quizId) =>
      `/api/quiz/${quizId}/results`,
    DELETE_QUIZ: (quizId) =>
      `/api/quiz/${quizId}`,
  },

  PROGRESS : {
    GET_DASHBOARD : '/api/progress/dashboard',
  },
};
