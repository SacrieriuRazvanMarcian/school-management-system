import axios from "axios";

export const api = axios.create({baseURL:'http://localhost:3000',});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token && config.headers){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401 && error.config.url !=='/auth/login') {
        localStorage.removeItem('token');
        window.location.href = '/login'; 
      }
      return Promise.reject(error);
    }
  );