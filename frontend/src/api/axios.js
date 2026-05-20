import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

console.log("🌍 API URL:", baseURL);

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", response.data);
    return response;
  },
  (error) => {
    console.log("❌ API ERROR:", error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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
<<<<<<< HEAD
// );
=======
// );
>>>>>>> 586b0f4 (frontend api fixed)
