/**
 * API Endpoints configuration
 * Centralized API endpoint management
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        REGISTER: `${API_BASE}/auth/register`,
        LOGIN: `${API_BASE}/auth/login`,
        LOGOUT: `${API_BASE}/auth/logout`,
        ME: `${API_BASE}/auth/me`,
    },
    
    // Profile endpoints
    PROFILE: {
        GET: `${API_BASE}/profile`,
        CREATE: `${API_BASE}/profile`,
        UPDATE: `${API_BASE}/profile`,
        DELETE: `${API_BASE}/profile`,
    },
    
    // Diet plan endpoints
    DIET: {
        GENERATE: `${API_BASE}/diet/generate`,
        HISTORY: `${API_BASE}/diet/history`,
        GET_BY_ID: (id) => `${API_BASE}/diet/${id}`,
        DELETE: (id) => `${API_BASE}/diet/${id}`,
        FAVORITE: (id) => `${API_BASE}/diet/${id}/favorite`,
    },
    
    // Analytics endpoints
    ANALYTICS: {
        BMI_TREND: `${API_BASE}/analytics/bmi-trend`,
        CALORIES_TREND: `${API_BASE}/analytics/calories-trend`,
        DIET_FREQUENCY: `${API_BASE}/analytics/diet-frequency`,
        STATS: `${API_BASE}/analytics/stats`,
    },
    
    // Admin endpoints
    ADMIN: {
        USERS: `${API_BASE}/admin/users`,
        USER_DETAILS: (id) => `${API_BASE}/admin/users/${id}`,
        DELETE_USER: (id) => `${API_BASE}/admin/users/${id}`,
        STATS: `${API_BASE}/admin/stats`,
        EXPORT: `${API_BASE}/admin/export`,
    },
};

// HTTP methods
export const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
};

// API response status
export const STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    LOADING: 'loading',
    IDLE: 'idle',
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    DIET_GENERATED: 'Diet plan generated successfully!',
    PLAN_SAVED: 'Plan saved to history!',
    PLAN_DELETED: 'Plan deleted successfully!',
};

export default ENDPOINTS;