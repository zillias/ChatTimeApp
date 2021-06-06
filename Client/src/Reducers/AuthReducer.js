import { createSlice } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode";

let initialState = { user: null, mySocketId: null };
if (localStorage.getItem("JwtToken")) {
  const decodedToken = jwtDecode(localStorage.getItem("JwtToken"));

  initialState.user = decodedToken;
}

export const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    login: (state, action) => {
      localStorage.setItem("JwtToken", action.payload.token);
      state.user = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem("JwtToken");
      state.user = null;
      state.mySocketId = null;
    },
    setMysocketId: (state, action) => {
      state.mySocketId = action.payload;
    },
  },
});

export const { login, logout, setMysocketId } = AuthSlice.actions;
export default AuthSlice.reducer;
