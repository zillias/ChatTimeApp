import { Grid, Typography, Button, Modal } from "@material-ui/core";
import React, { useContext } from "react";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import { useSelector } from "react-redux";

import "./VideoChat.css";
import { VideoChatContext } from "./VideoProvider";

export default function VideoChat() {
  const {
    myVideo,
    callAccepted,
    call,
    userVideo,
    leaveCall,
    answerCall,
    openVideoChat,
    setOpenVideoChat,
  } = useContext(VideoChatContext);
  const { receiver } = useSelector((state) => state.users);
  return (
    <Modal open={openVideoChat} className="modal">
      <>
        {call && call?.isReceivingCall && !callAccepted && (
          <div className="welcomeModal">
            <Typography gutterBottom variant="h5">
              <span>{call?.from?.username}</span> is calling you...
            </Typography>
            <div>
              <Button
                onClick={() => answerCall("accept")}
                variant="contained"
                color="primary"
              >
                Accept Call
              </Button>
              <Button
                style={{ marginLeft: "10px" }}
                variant="contained"
                color="secondary"
                onClick={() => answerCall("refuse")}
              >
                Hang Up
              </Button>
            </div>
          </div>
        )}

        {!call && !callAccepted && (
          <div className="welcomeModal">
            <Typography gutterBottom variant="h5">
              Calling <span> {receiver?.username}</span> ! Wainting for his
              response ...
            </Typography>
            <Button
              style={{ margin: "10px auto" }}
              variant="contained"
              color="secondary"
              onClick={() => leaveCall()}
            >
              Cancel
            </Button>
          </div>
        )}

        {call && call.refused && (
          <div className="welcomeModal">
            <Typography gutterBottom variant="h5">
              <span> {receiver?.username}</span> refused your call
            </Typography>
            <Button
              style={{ margin: "10px auto" }}
              variant="contained"
              color="secondary"
              onClick={() => setOpenVideoChat(false)}
            >
              Close
            </Button>
          </div>
        )}

        {callAccepted && (
          <Grid container justify="center" alignItems="center">
            <Grid style={{ position: "relative" }} item sm={8} xs={12}>
              <video
                playsInline
                autoPlay
                ref={userVideo}
                className="receiverVideo"
              />
              <Button
                size="large"
                className="endCallBtn"
                variant="contained"
                color="secondary"
                onClick={() => leaveCall()}
              >
                <VideocamOffIcon />
              </Button>
            </Grid>
            <Grid>
              <Grid item sm={4} xs={12}>
                <video
                  playsInline
                  autoPlay
                  muted
                  ref={myVideo}
                  className="myVideo"
                />
              </Grid>
            </Grid>
          </Grid>
        )}
      </>
    </Modal>
  );
}
