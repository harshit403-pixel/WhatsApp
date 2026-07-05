import { useDispatch } from "react-redux";

import {
  setUser,
  setAccessToken,
  setLoading,
  setError,
  setAuthChecked,
  logout as logoutAction,
} from "../state/auth.slice";

import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../services/auth.api";

const useAuth = () => {
  const dispatch = useDispatch();

  /**
   * Register a new user
   */
  const register = async ({
    username,
    email,
    password,
  }) => {
    try {
      // Start loading
      dispatch(setLoading(true));

      // Clear previous errors
      dispatch(setError(null));

      // Call register API
      const data = await registerUser({
        username,
        email,
        password,
      });

      // Save logged-in user
      dispatch(setUser(data.user));

      // Mark auth check complete
      dispatch(setAuthChecked(true));

      // Save access token if you're storing it
      if (data.accessToken) {
        dispatch(setAccessToken(data.accessToken));
      }

      return data;
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message ||
            "Registration failed"
        )
      );

      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Login existing user
   */
  const login = async ({ email, password }) => {
    try {  
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Call login API
      const data = await loginUser({
        email,
        password,
      });

      // Save user in Redux
      dispatch(setUser(data.user));

      // Mark auth check complete
      dispatch(setAuthChecked(true));

      // Save token if backend returns it
      if (data.accessToken) {
        dispatch(setAccessToken(data.accessToken));
      }

      return data;
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message ||
            "Login failed"
        )
      );

      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      dispatch(setLoading(true));

      // Remove cookies/session on backend
      await logoutUser();

      // Clear Redux state
      dispatch(logoutAction());

      // Auth check is complete
      dispatch(setAuthChecked(true));
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message ||
            "Logout failed"
        )
      );

      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Restore user from cookie after refresh
   */
 const fetchMe = async () => {
  try {
    dispatch(setLoading(true));

    const data = await getCurrentUser();

    dispatch(setUser(data.data.user));
  } catch (error) {
    dispatch(logoutAction());
  } finally {
    dispatch(setAuthChecked(true));
    dispatch(setLoading(false));
  }
};

  return {
    register,
    login,
    logout,
    fetchMe,
  };
};

export default useAuth;