import axios from 'axios';

// DIRECT LINK TO HF BACKEND
const API_BASE_URL = 'https://arko007-movie-backend.hf.space';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log("API Base URL:", API_BASE_URL);

export const getSuggestions = async () => {
    try {
        const response = await api.get('/api/suggestions');
        return response.data.suggestions;
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};

export const getMovies = async (params) => {
    try {
        const response = await api.get('/api/movies', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching movies:", error);
        throw error;
    }
};

export const getMovieDetails = async (id) => {
    try {
        const response = await api.get(`/api/movie/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for movie ${id}:`, error);
        throw error;
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

export const searchMovieByTitle = async (title) => {
    try {
        const response = await api.get('/api/movies', { 
            params: { search: title, limit: 1 } 
        });
        return response.data.movies?.[0] || null;
    } catch (error) {
        console.error(`Error searching for movie "${title}":`, error);
        return null;
    }
};
