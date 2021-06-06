import React, { createContext } from "react";
import { io } from "socket.io-client";

const socket = io("https://mighty-mountain-71972.herokuapp.com");
const SocketContext = createContext();

function SocketProvider(props) {
  return <SocketContext.Provider value={{ socket }} {...props} />;
}

export { SocketContext, SocketProvider };
