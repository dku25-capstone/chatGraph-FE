import axios from "axios";

export const api = axios.create({
  baseURL: "https://3.34.91.83",
  withCredentials: true,
  timeout: 15000, // 5초후 실패 처리
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
