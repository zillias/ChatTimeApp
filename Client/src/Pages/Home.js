import React, { useEffect } from "react";
import { CircularProgress, Grid, Typography } from "@material-ui/core";
import { Redirect } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useSelector, useDispatch } from "react-redux";

import "./Home.css";
import { getUsers } from "../GraqhQl";
import Messages from "../Components/Messages";
import SideBar from "../Components/SideBar";
import VideoChat from "../Components/VideoChat";
import { VideoProvider } from "../Components/VideoProvider";
import { getAllUsers } from "../Reducers/UsersReducer";

export default function Home() {
  const { receiver } = useSelector((state) => state.users);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  let { loading, data } = useQuery(getUsers);

  useEffect(() => {
    if (data) {
      dispatch(
        getAllUsers(
          data.getUsers.filter((user) => user.username !== auth.user.username)
        )
      );
    }
  }, [data]);

  return auth.user ? (
    loading ? (
      <div className="progress">
        <CircularProgress />
      </div>
    ) : (
      <VideoProvider>
        <Grid container alignItems="flex-start" className="mainContainer">
          <Grid item md={3} xs={12} className="contactsContainer">
            <SideBar />
          </Grid>

          {receiver ? (
            <Grid item className="messagesContainer" md={9} xs={12}>
              <Messages />
            </Grid>
          ) : (
            <Grid item md={9} xs={12} className="emptyChat">
              <Typography>Select a user to start a conversation</Typography>
            </Grid>
          )}
        </Grid>
        <VideoChat />
      </VideoProvider>
    )
  ) : (
    <Redirect to="/login" />
  );
}
