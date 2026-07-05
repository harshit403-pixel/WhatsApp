import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    loading: false,
    error: null,
    isAuthChecked: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setAuthChecked: (state, action) => {
      state.isAuthChecked = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
      state.isAuthChecked = true;
    },
  },
});

export const {
  setUser,
  setAccessToken,
  setLoading,
  setError,
  setAuthChecked,
  logout,
} = authSlice.actions;

export default authSlice.reducer;