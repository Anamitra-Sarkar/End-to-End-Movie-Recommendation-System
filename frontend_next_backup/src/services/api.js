import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getSuggestions = async () => {
    try {
        const response = await api.get('/api/suggestions');
        return response.data.suggestions;
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};

export const getRecommendations = async (movieTitle) => {
    try {
        const response = await api.post('/recommend', { movie_title: movieTitle });
        return response.data;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
    }
};
