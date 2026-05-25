import axios from 'axios';

const API_ROOT_URL = (import.meta.env.VITE_API_URL || "https://bharatsecure-backend.onrender.com").replace(/\/$/, "");
const API_URL = `${API_ROOT_URL}/api`;

export const getComments = async (incidentId) => {
    const response = await axios.get(`${API_URL}/incidents/${incidentId}/comments/`);
    return response.data;
};

export const addComment = async (incidentId, commentData, token) => {
    const response = await axios.post(`${API_URL}/incidents/${incidentId}/comments/`, commentData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
