import { configureStore } from "@reduxjs/toolkit";

import AuthReducer from "./AuthReducer";
import NotificationsReducer from "./NotificationsReducer";
import UsersReducer from "./UsersReducer";

export default configureStore({
  reducer: {
    auth: AuthReducer,
    notifications: NotificationsReducer,
    users: UsersReducer,
  },
});
