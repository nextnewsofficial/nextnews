import axios from 'axios';
import {API_BASE_URL} from '../config/constants';

const createArticle = async (articleData, token) => {
    const response = await axios.post(`${API_BASE_URL}/api/articles`, articleData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

const uploadMedia = async (id, files, type, token) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await axios.post(`${API_BASE_URL}/api/articles/upload/${id}`, formData, {
        params: {type},
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const unpublishArticle = async (id, remark, token) => {
    const response = await axios.patch(`${API_BASE_URL}/api/articles/unpublish/${id}`, {}, {
        params: {remark},
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

const reviewArticle = async (id, toStatus, remark, token) => {
    const response = await axios.patch(`${API_BASE_URL}/api/articles/review/${id}`, {}, {
        params: {toStatus, remark},
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Get draft articles
const getDraftArticles = async (journalistId) => {
    const response = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
        params: {
            status: 'DRAFT',
            published: false,
            journalistId: journalistId,
            pageNumber: 0,
            pageSize: 100,
            sortBy: 'updatedAt',
            sortOrder: 'DESC'
        }
    });
    return response.data.content; // Assuming the response has a content array
};

const getUnderReviewArticles = async (journalistId) => {
    const response = await axios.get(`${API_BASE_URL}/public/v1/articles/home`, {
        params: {
            status: 'UNDER_REVIEW',
            published: false,
            pageNumber: 0,
            pageSize: 100,
            sortBy: 'updatedAt',
            sortOrder: 'DESC'
        }
    });
    return response.data.content; // Assuming the response has a content array
};

// Update article
const updateArticle = async (id, updateData, token) => {
    const response = await axios.patch(`${API_BASE_URL}/api/articles/${id}`, updateData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export {createArticle, uploadMedia, updateArticle, unpublishArticle, reviewArticle, getDraftArticles, getUnderReviewArticles};