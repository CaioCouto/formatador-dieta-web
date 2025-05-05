import axios from "axios";

export const instance = axios.create({
  baseURL: import.meta.env.VITE_LOCALHOST_API_BASE_URL,
  header: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Credentials": true
  },
});

instance.defaults.withCredentials = true;