import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
import Peer from "simple-peer";
import { useSelector } from "react-redux";

import { SocketContext } from "../SocketProvider";

const VideoChatContext = createContext();

function VideoProvider(props) {
  const auth = useSelector((state) => state.auth);
  const { receiver } = useSelector((state) => state.users);
  const { socket } = useContext(SocketContext);
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState(null);
  const [openVideoChat, setOpenVideoChat] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        if (openVideoChat) {
          myVideo.current.srcObject = currentStream;
        }
      });
  }, [callAccepted]);

  useEffect(() => {
    socket.on("callUser", ({ from, signal }) => {
      setOpenVideoChat(true);
      setCall({ isReceivingCall: true, from, signal });
    });
    socket.on("callRefused", () => {
      setCall({ refused: true });
    });
    socket.on("callEnded", () => {
      setCall(null);
      setCallAccepted(false);
      setOpenVideoChat(false);
      window.location.reload();
    });
  }, []);

  useEffect(() => {
    if (openVideoChat) {
      socket.emit("userOnCall", auth.user.username);
    } else {
      socket.emit("userActive", auth.user.username);
    }
  }, [openVideoChat]);

  const answerCall = (response) => {
    if (response === "accept") {
      setCallAccepted(true);
      const peer = new Peer({ initiator: false, trickle: false, stream });

      peer.on("signal", (data) => {
        socket.emit("answerCall", {
          to: call.from.socketId,
          signal: data,
        });
      });

      peer.on("stream", (currentStream) => {
        userVideo.current.srcObject = currentStream;
      });

      peer.signal(call.signal);

      connectionRef.current = peer;
    } else if (response === "refuse") {
      socket.emit("refuseCall", { to: call.from.socketId });
      setOpenVideoChat(false);
    }
  };

  const callUser = () => {
    setOpenVideoChat(true);
    setCall(null);
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        from: { username: auth.user.username, socketId: auth.mySocketId },
        signal: data,
        to: receiver.socketId,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    socket.emit("endCall", {
      to: receiver?.socketId || call?.from?.socketId,
    });
    setCallAccepted(false);
    setCall(null);
    setOpenVideoChat(false);
    connectionRef.current.destroy();
    window.location.reload();
  };
  return (
    <VideoChatContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        callUser,
        leaveCall,
        answerCall,
        openVideoChat,
        setOpenVideoChat,
      }}
      {...props}
    />
  );
}

export { VideoChatContext, VideoProvider };
