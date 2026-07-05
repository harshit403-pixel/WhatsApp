import axios from "axios";
import { store } from "../../app/app.store";
import {
  setAccessToken,
  logout,
} from "../auth/state/auth.slice";

/**
 * Global axios instance.
 *
 * Base URL:
 * /api
 *
 * Examples:
 * globalApi.get("/rooms")
 * -> GET /api/rooms
 *
 * globalApi.post("/messages")
 * -> POST /api/messages
 */
const globalApi = axios.create({
  baseURL: "/api",

  /**
   * Sends cookies automatically.
   *
   * Required for:
   * - Refresh token cookie
   * - Session-based authentication
   * - Cross-origin requests with credentials
   */
  withCredentials: true,
});

globalApi.interceptors.request.use(
  (config) => {
    const accessToken =
      store.getState().auth.accessToken;

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

globalApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      originalRequest?.url !==
        "/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          "/api/auth/refresh-token",
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken =
          response.data.data.accessToken;

        store.dispatch(
          setAccessToken(
            newAccessToken
          )
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return globalApi(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default globalApi;
