// constants/config.js
import axios from 'axios';
import tokenService from './tokenservice';

const api = axios.create({
  baseURL: "http://157.66.27.69:5000",
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config) => {
    const token = await tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized - Invalid token");
      // Handle token expiration (optional)
    }
    return Promise.reject(error);
  }
);

export default api;
