import axios from "axios";
import { addToQueue, getRefreshing, setRefreshing } from "../axiosSessionQueue";

export const instance = axios.create({
  baseURL: import.meta.env.VITE_LOCALHOST_API_BASE_URL,
  header: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": true
  },
});

instance.defaults.withCredentials = true;
instance.interceptors.response.use(
  res => res,
  error => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if(!getRefreshing()) {
        setRefreshing(true);
        window.dispatchEvent(new CustomEvent('unauthorized-session'));
      }

      return addToQueue(originalRequest);
    }

    return Promise.reject(error);
  }
);