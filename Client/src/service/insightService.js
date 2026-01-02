import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const createInsight = async ({ documentId, type, title, content }) => {
  try {
    const response = await axiosInstance.post('/api/insights', {
      documentId,
      type,
      title,
      content,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create insight.' };
  }
};

const getInsightsByDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(`/api/insights/${documentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch insights.' };
  }
};

const updateInsightTitle = async (id, title) => {
  try {
    const response = await axiosInstance.put(`/api/insights/${id}`, { title });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update insight title.' };
  }
};

export default {
  createInsight,
  getInsightsByDocument,
  updateInsightTitle,
};
