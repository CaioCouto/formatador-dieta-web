import axiosInstance from "../axiosInstance";

let isRefreshing = false;
let failedQueue = [];

export const processQueue = (error, sessionRestored = false) => {
  failedQueue.forEach(async (prom) => {
    if (sessionRestored) {
      await prom.resolve();
    } else {
      await prom.reject(error);
    }
  });

  failedQueue = [];
};

export const addToQueue = async (requestConfig) => {
  return await new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then(() => axiosInstance(requestConfig));
};

export const setRefreshing = (state) => {
  isRefreshing = state;
};

export const getRefreshing = () => isRefreshing;
