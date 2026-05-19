/**
 * Application Constants
 */

// Activity levels
export const ACTIVITY_LEVELS = {
    sedentary: {
        label: 'Sedentary',
        description: 'Little or no exercise',
        multiplier: 1.2,
        icon: '🪑',
        color: 'gray'
    },
    light: {
        label: 'Light',
        description: 'Exercise 1-3 days/week',
        multiplier: 1.375,
        icon: '🚶',
        color: 'blue'
    },
    moderate: {
        label: 'Moderate',
        description: 'Exercise 3-5 days/week',
        multiplier: 1.55,
        icon: '🏃',
        color: 'green'
    },
    active: {
        label: 'Active',
        description: 'Exercise 6-7 days/week',
        multiplier: 1.725,
        icon: '💪',
        color: 'orange'
    },
    veryActive: {
        label: 'Very Active',
        description: 'Hard exercise daily',
        multiplier: 1.9,
        icon: '🏋️',
        color: 'red'
    }
};

// Goals
export const GOALS = {
    fatLoss: {
        label: 'Fat Loss',
        description: 'Lose weight and reduce body fat',
        icon: '🔥',
        color: 'orange',
        calorieAdjustment: -500
    },
    muscleGain: {
        label: 'Muscle Gain',
        description: 'Build muscle and increase strength',
        icon: '💪',
        color: 'blue',
        calorieAdjustment: 300
    },
    maintenance: {
        label: 'Maintenance',
        description: 'Maintain current weight',
        icon: '⚖️',
        color: 'green',
        calorieAdjustment: 0
    }
};

// Food types
export const FOOD_TYPES = {
    veg: {
        label: 'Vegetarian',
        icon: '🥦',
        color: 'green'
    },
    nonVeg: {
        label: 'Non-Vegetarian',
        icon: '🍗',
        color: 'red'
    },
    vegan: {
        label: 'Vegan',
        icon: '🌱',
        color: 'emerald'
    },
    eggetarian: {
        label: 'Eggetarian',
        icon: '🥚',
        color: 'yellow'
    }
};

// Genders
export const GENDERS = {
    male: {
        label: 'Male',
        icon: '👨',
        color: 'blue'
    },
    female: {
        label: 'Female',
        icon: '👩',
        color: 'pink'
    },
    other: {
        label: 'Other',
        icon: '🧑',
        color: 'purple'
    }
};

// BMI Categories
export const BMI_CATEGORIES = {
    underweight: {
        label: 'Underweight',
        range: '< 18.5',
        color: 'blue',
        advice: 'Consider gaining weight through nutrient-rich foods and strength training.'
    },
    normal: {
        label: 'Normal',
        range: '18.5 - 24.9',
        color: 'green',
        advice: 'Great! Maintain with balanced diet and regular exercise.'
    },
    overweight: {
        label: 'Overweight',
        range: '25 - 29.9',
        color: 'yellow',
        advice: 'Consider moderate calorie deficit and increased physical activity.'
    },
    obese: {
        label: 'Obese',
        range: '≥ 30',
        color: 'red',
        advice: 'Consult healthcare provider. Focus on gradual, sustainable weight loss.'
    }
};

// Days of week
export const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

// Meal types
export const MEALS = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'yellow' },
    { id: 'lunch', label: 'Lunch', icon: '☀️', color: 'orange' },
    { id: 'dinner', label: 'Dinner', icon: '🌙', color: 'purple' },
    { id: 'snacks', label: 'Snacks', icon: '🍎', color: 'green' }
];

// Local storage keys
export const STORAGE_KEYS = {
    THEME: 'nutriplan-theme',
    TOKEN: 'token',
    USER: 'user',
    SETTINGS: 'settings'
};

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        ME: '/auth/me'
    },
    PROFILE: {
        GET: '/profile',
        CREATE: '/profile',
        UPDATE: '/profile',
        DELETE: '/profile'
    },
    DIET: {
        GENERATE: '/diet/generate',
        HISTORY: '/diet/history',
        GET_BY_ID: (id) => `/diet/${id}`,
        DELETE: (id) => `/diet/${id}`,
        FAVORITE: (id) => `/diet/${id}/favorite`
    },
    ANALYTICS: {
        BMI_TREND: '/analytics/bmi-trend',
        CALORIES_TREND: '/analytics/calories-trend',
        DIET_FREQUENCY: '/analytics/diet-frequency',
        STATS: '/analytics/stats'
    }
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    FORBIDDEN: 'You do not have permission.',
    NOT_FOUND: 'Resource not found.',
    SERVER: 'Server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    DIET_GENERATED: 'Diet plan generated successfully!',
    PLAN_SAVED: 'Plan saved to history!',
    PLAN_DELETED: 'Plan deleted successfully!'
};

// Theme options
export const THEMES = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' }
];

// App info
export const APP_INFO = {
    name: 'NutriPlan AI',
    version: '1.0.0',
    description: 'AI-Powered Personalized Diet Planner',
    author: 'NutriPlan Team',
    email: 'support@nutriplan.com',
    website: 'https://nutriplan.com'
};