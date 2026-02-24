import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Ideally from import.meta.env.VITE_API_URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const customError = {
            message: error.response?.data?.message || 'Something went wrong',
            status: error.response?.status,
        };
        // You could trigger a global notification / toast here
        return Promise.reject(customError);
    }
);

export default api;
