import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
  name: "Users",
  initialState: {
    allUsers: null,
    onlineUsers: null,
    sortedUsers: null,
    receiver: null,
  },
  reducers: {
    getAllUsers: (state, action) => {
      state.allUsers = action.payload;
      state.sortedUsers = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;

      state.sortedUsers = state.allUsers
        .map((user) => {
          const userConnected = action.payload.find(
            (onlineUser) => onlineUser.username === user.username
          );
          if (userConnected) {
            return userConnected;
          } else return user;
        })
        .sort((x) => (!x.active ? 1 : -1));
    },
    addUser: (state, action) => {
      state.allUsers.push({
        username: action.payload.username,
        id: action.payload.id,
      });
      state.sortedUsers.push(action.payload).sort((x) => (!x.active ? 1 : -1));
    },
    setReceiver: (state, action) => {
      state.receiver = action.payload;
    },
  },
});

export const { getAllUsers, setOnlineUsers, addUser, setReceiver } =
  usersSlice.actions;
export default usersSlice.reducer;
