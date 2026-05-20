import axios from 'axios';

const baseURL =
  "https://ai-diet-planner-backend-production-ee54.up.railway.app/api";

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("🚀 REQUEST:", config.baseURL + config.url);

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", response.data);
    return response;
  },
  (error) => {
    console.log("❌ API ERROR:", error.response?.data || error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

// import axios from 'axios';

// const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// export const api = axios.create({
//   baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );
