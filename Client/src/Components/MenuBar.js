import { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Badge,
  Button,
  Collapse,
  List,
  ListItem,
  Paper,
  Popper,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { useSelector, useDispatch } from "react-redux";

import "./MenuBar.css";
import { getStoredNotifications } from "../GraqhQl";
import { getNotifications } from "../Reducers/NotificationsReducer";
import { logout } from "../Reducers/AuthReducer";
import { setReceiver } from "../Reducers/UsersReducer";

export default function MenuBar() {
  const { sortedUsers } = useSelector((state) => state.users);
  const auth = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();

  const [openNotifications, setOpenNotifications] = useState(false);
  const notificationRef = useRef(null);

  const { data: notificationsData } = useQuery(getStoredNotifications);

  useEffect(() => {
    if (notificationsData) {
      dispatch(getNotifications(notificationsData.getNotifications));
    }
  }, [notificationsData]);

  const handleLogout = () => {
    dispatch(logout());
    window.location.reload();
  };

  const openChat = (username) => {
    dispatch(
      setReceiver(sortedUsers.find((user) => user.username === username))
    );
    setOpenNotifications(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className="logo">
          Chat Time
        </Typography>
        {!auth.user ? (
          <>
            <Link className="link" to="/login">
              <Button color="inherit" variant="outlined">
                Login
              </Button>
            </Link>
            <Link className="link" to="/register">
              <Button color="inherit" variant="outlined">
                Register
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Typography variant="h6" className="username">
              {auth.user.username}
            </Typography>
            <Badge
              badgeContent={notifications.length}
              color="secondary"
              invisible={notifications.length === 0}
            >
              <NotificationsIcon
                ref={notificationRef}
                onClick={() => setOpenNotifications(!openNotifications)}
              />
            </Badge>
            <Popper
              style={{ marginTop: "18px" }}
              open={true}
              anchorEl={notificationRef.current}
            >
              <Collapse in={openNotifications}>
                <Paper elevation={4}>
                  <List>
                    {notifications.length === 0 ? (
                      <ListItem>
                        <Typography>You have no notifications</Typography>
                      </ListItem>
                    ) : (
                      notifications.map((notification, index) => (
                        <ListItem
                          button
                          onClick={() => openChat(notification.from)}
                          key={index}
                        >
                          <Typography>
                            You received {notification.messagesCount}{" "}
                            {notification.messagesCount === 1
                              ? "message"
                              : "messages"}{" "}
                            from {notification.from}
                          </Typography>
                        </ListItem>
                      ))
                    )}
                  </List>
                </Paper>
              </Collapse>
            </Popper>
            <Button
              className="btn"
              color="inherit"
              variant="outlined"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
