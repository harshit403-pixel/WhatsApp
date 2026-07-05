import axios from "axios";

import { store } from "../../../app/app.store";
import {
  setAccessToken,
  logout,
} from "../state/auth.slice";

/**
 * Axios instance for auth APIs.
 */
const authApi = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

/**
 * Request Interceptor
 * Attaches access token from Redux.
 */
authApi.interceptors.request.use(
  (config) => {
    const accessToken =
      store.getState().auth.accessToken;

    console.log(
      "REQUEST:",
      config.url,
      "TOKEN:",
      accessToken
    );

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Automatically refreshes access token on 401.
 */
authApi.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    console.log(
      "RESPONSE ERROR:",
      originalRequest?.url,
      error.response?.status
    );

    // Prevent infinite loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !==
        "/refresh-token"
    ) {
      originalRequest._retry = true;

      try {
        console.log(
          "Refreshing access token..."
        );

        /**
         * IMPORTANT:
         * Use plain axios here instead of authApi.
         */
        const response =
          await axios.post(
            "/api/auth/refresh-token",
            {},
            {
              withCredentials: true,
            }
          );

        const newAccessToken =
          response.data.data.accessToken;

        console.log(
          "NEW ACCESS TOKEN:",
          newAccessToken
        );

        /**
         * Save token in Redux.
         */
        store.dispatch(
          setAccessToken(
            newAccessToken
          )
        );

        /**
         * Retry original request
         * with new token.
         */
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        console.log(
          "Retrying:",
          originalRequest.url
        );

        return authApi(
          originalRequest
        );
      } catch (refreshError) {
        console.log(
          "Refresh token failed:",
          refreshError
        );

        store.dispatch(logout());

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Register user
 */
export const registerUser =
  async ({
    username,
    email,
    password,
  }) => {
    const response =
      await authApi.post(
        "/register",
        {
          username,
          email,
          password,
        }
      );

    return response.data;
  };

/**
 * Login user
 */
export const loginUser = async ({
  email,
  password,
}) => {
  const response =
    await authApi.post("/login", {
      email,
      password,
    });

  return response.data.data;
};

/**
 * Logout user
 */
export const logoutUser =
  async () => {
    const response =
      await authApi.post(
        "/logout"
      );

    return response.data;
  };

/**
 * Get current logged-in user.
 */
export const getCurrentUser =
  async () => {
    const response =
      await authApi.get(
        "/current-user"
      );

    return response.data;
  };

/**
 * Manual refresh token endpoint.
 */
export const refreshToken =
  async () => {
    const response =
      await authApi.post(
        "/refresh-token"
      );

    return response.data;
  };

export default authApi;