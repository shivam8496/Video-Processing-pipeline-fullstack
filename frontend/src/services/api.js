import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;


const api = axios.create({
    baseURL:API_URL
})

// Runs before every request 
api.interceptors.request.use((config) => {
  // 1. Get the user object from local storage
  const user = JSON.parse(localStorage.getItem('user'));

  // 2. If the user and token exist...
  if (user && user.token) {
    // 3. ...ADD the "Bearer" prefix to the header
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  
  return config;
});

export default api;
