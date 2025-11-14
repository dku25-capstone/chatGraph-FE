import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 10초후 실패 처리
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 범위를 벗어난 에러 응답
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      originalRequest.url !== "/api/login" &&
      originalRequest.url !== "/api/refresh" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.error("RefreshToken 이 없습니다. 로그아웃 처리됩니다.");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(error);
        }
        // 토큰 갱신 api 호출
        const refreshResponse = await api.post("/api/refresh", {
          refreshToken: refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data;

        // 새 토큰들을 localStorage에 저장
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        console.log("토큰 갱신 성공, 원래 요청을 재시도합니다.");
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 자체를 실패한 경우
        console.error("토큰 갱신 실패, 로그아웃 처리", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    // 401이 아닌 다른 모든 에러는 그대로 반환
    return Promise.reject(error);
  }
);
