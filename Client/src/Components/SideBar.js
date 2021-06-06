import React, { useState, useEffect, useContext } from "react";
import {
  InputAdornment,
  List,
  TextField,
  ListItem,
  IconButton,
  Typography,
  Divider,
  ListSubheader,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import { useSelector, useDispatch } from "react-redux";

import "./SideBar.css";
import { setOnlineUsers, addUser, setReceiver } from "../Reducers/UsersReducer";
import { addNotification } from "../Reducers/NotificationsReducer";
import { SocketContext } from "../SocketProvider";

export default function SideBar() {
  const { sortedUsers, receiver } = useSelector((state) => state.users);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    socket.emit("UserConnection", {
      username: auth.user.username,
      id: auth.user.id,
    });
    socket.on("UsersConnected", (connectedUsers) => {
      dispatch(setOnlineUsers(connectedUsers));
    });
    socket.on("UserAdded", (newUser) => {
      dispatch(addUser(newUser));
    });
  }, []);

  useEffect(() => {
    socket.on("messageReceived", ({ from }) => {
      if (!receiver || from !== receiver?.username) {
        dispatch(addNotification(from));
      }
    });
    return () => {
      socket.off("messageReceived");
    };
  }, [receiver]);

  useEffect(() => {
    if (receiver) {
      dispatch(
        setReceiver(
          sortedUsers.find(
            (sortedUser) => sortedUser.username === receiver.username
          )
        )
      );
    }
  }, [sortedUsers]);

  useEffect(() => {
    if (searchValue !== "") {
      setFilteredUsers(
        sortedUsers.filter((user) => user.username.includes(searchValue))
      );
    } else setFilteredUsers(sortedUsers);
  }, [searchValue, sortedUsers]);

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="sidebar">
      <TextField
        fullWidth
        type="text"
        value={searchValue}
        onChange={handleChange}
        variant="outlined"
        placeholder="Search for a contact..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setSearchValue("")}>
                {searchValue === "" ? <SearchIcon /> : <CloseIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <ListSubheader className="subheader">
        <Typography color="primary" variant="subtitile1">
          Contacts
        </Typography>
        <Divider />
      </ListSubheader>
      <List className="userslist">
        {filteredUsers?.length > 0 ? (
          filteredUsers.map((user) => (
            <ListItem
              button
              selected={user.username === receiver?.username ? true : false}
              onClick={() => dispatch(setReceiver(user))}
              key={user.id}
              className="user"
            >
              <Typography className="userName" variant="body1">
                {user.username}
              </Typography>
              <Typography
                className={
                  user.isOnCall ? "onCall" : user.active ? "online" : "offline"
                }
                variant="subtitle2"
              >
                {user.isOnCall
                  ? "On Call"
                  : user.active
                  ? "Connected"
                  : "Disconnected"}
              </Typography>
            </ListItem>
          ))
        ) : (
          <Typography>No user found !</Typography>
        )}
      </List>
    </div>
  );
}
