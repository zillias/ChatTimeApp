import React, { useContext, useState, useEffect, useCallback } from "react";
import { CircularProgress, IconButton, Typography } from "@material-ui/core";
import { useQuery, useMutation } from "@apollo/client";
import moment from "moment";
import VideocamIcon from "@material-ui/icons/Videocam";
import { useSelector, useDispatch } from "react-redux";

import "./Messages.css";
import {
  getMessages,
  sendMessage,
  addNotification,
  deleteNotification,
} from "../GraqhQl";
import { VideoChatContext } from "./VideoProvider";
import { removeNotification } from "../Reducers/NotificationsReducer";
import { SocketContext } from "../SocketProvider";

export default function Messages() {
  const { callUser } = useContext(VideoChatContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);

  const { receiver } = useSelector((state) => state.users);

  const setRef = useCallback((node) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const {
    loading,
    data: conversationData,
    refetch,
  } = useQuery(getMessages, {
    variables: { username: auth.user.username, to: receiver.username },
  });

  useEffect(() => {
    if (conversationData) {
      setMessages(conversationData.getMessages);
    }
  }, [conversationData]);

  const [createMessage, { loading: sendLoading }] = useMutation(sendMessage, {
    variables: { body: message, to: receiver.username },
    update(proxy, result) {
      setMessage("");
      setMessages((messages) => [...messages, result.data.sendMessage]);
      socket.emit("newMessage", {
        to: receiver.socketId,
        message: result.data.sendMessage,
        from: auth.user.username,
      });
    },
  });

  const [createNotification, __] = useMutation(addNotification, {
    variables: { to: receiver.username },
  });

  const [updateMyNotifications, _] = useMutation(deleteNotification, {
    variables: { from: receiver.username },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      createMessage();
      createNotification();
    }
  };

  useEffect(() => {
    socket.on("messageReceived", ({ from, message }) => {
      if (from === receiver.username) {
        setMessages((messages) => [...messages, message]);
        updateMyNotifications();
        dispatch(removeNotification(receiver.username));
      }
    });
    refetch();
    updateMyNotifications();
    dispatch(removeNotification(receiver.username));

    return () => {
      socket.off("messageReceived");
    };
  }, [receiver]);

  return (
    <>
      <div className="messagesHeader">
        <Typography color="inherit" variant="h6">
          {receiver.username}
        </Typography>
        <IconButton
          onClick={() => callUser()}
          color="inherit"
          disabled={!receiver.active || receiver.isOnCall}
          style={{ padding: "0px" }}
        >
          <VideocamIcon fontSize="large" />
        </IconButton>
      </div>
      <div className="messagesContainer">
        <div className="messages">
          {loading ? (
            <div className="progress">
              <CircularProgress />
            </div>
          ) : (
            <>
              {messages.length > 0 &&
                messages.map((message, index) => (
                  <div
                    ref={messages.length - 1 === index ? setRef : null}
                    className="message"
                    key={message.id}
                  >
                    <div
                      className={
                        auth?.user?.username === message.sender
                          ? "messageText messageText-sent"
                          : "messageText"
                      }
                    >
                      <Typography variant="subtitle2">
                        {message.body}
                      </Typography>
                    </div>
                    <p
                      className={
                        auth?.user?.username === message.sender
                          ? "messageInfo messageInfo-sent"
                          : "messageInfo"
                      }
                    >
                      {`${
                        auth?.user?.username === message.sender
                          ? "you"
                          : message.sender
                      } : ${moment(parseInt(message.createdAt)).fromNow()}`}
                    </p>
                  </div>
                ))}
            </>
          )}
        </div>
        <form className="inputContainer" onSubmit={handleSubmit}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send message ..."
            disabled={sendLoading}
          />
          <button
            disabled={sendLoading}
            style={{ display: "none" }}
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
