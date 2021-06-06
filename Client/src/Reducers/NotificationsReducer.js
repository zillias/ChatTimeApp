import { createSlice } from "@reduxjs/toolkit";

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { notifications: [] },
  reducers: {
    getNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      const prevNotifications = state.notifications.find(
        (notification) => notification.from === action.payload
      );
      if (prevNotifications) {
        state.notifications = state.notifications.map((notification) => {
          if (notification.from === action.payload) {
            return {
              from: notification.from,
              messagesCount: notification.messagesCount + 1,
            };
          } else return notification;
        });
      } else
        state.notifications.push({ from: action.payload, messagesCount: 1 });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.from !== action.payload
      );
    },
  },
});

export const { getNotifications, addNotification, removeNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
