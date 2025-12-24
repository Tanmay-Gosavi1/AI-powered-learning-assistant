import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const uploadDocument = async (file) => {
    try {
        const formData = new FormData();
        formData.append('document', file);
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while uploading document.' };
    }
};

const getAllDocuments = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while fetching documents.' };
    }
};

const getDocumentById = async (id) => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while fetching document.' };
    }
};

const updateDocument = async (id, updateData) => {
    try {
        const response = await axiosInstance.put(API_PATHS.DOCUMENTS.UPDATE_DOCUMENT(id), updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while updating document.' };
    }
};

const deleteDocument = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'An error occurred while deleting document.' };
    }
};

const docService = {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
};

export default docService; 