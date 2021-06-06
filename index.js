import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { MONGODB } from "./Config.js";
import typeDefs from "./GraphQl/TypeDefs.js";
import resolvers from "./GraphQl/Resolvers.js";

const PORT = process.env.PORT || 5000;

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
  });
  mongoose
    .connect(MONGODB, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
      console.log("Connected to MongoDb");
    })
    .catch((err) => console.error(err));

  await server.start();

  app.use(cors());

  server.applyMiddleware({ app });

  let connectedUsers = [];

  io.on("connection", (socket) => {
    socket.emit("mySocketId", socket.id);

    socket.on("newMessage", ({ to, message, from }) => {
      io.to(to).emit("messageReceived", { from, message });
    });

    socket.on("NewUser", ({ username, id }) => {
      socket.broadcast.emit("UserAdded", {
        username,
        id,
        socketId: socket.id,
        isOncall: false,
        online: true,
      });
    });

    socket.on("UserConnection", ({ username, id }) => {
      connectedUsers.push({
        username,
        id,
        socketId: socket.id,
        isOnCall: false,
        active: true,
      });
      io.emit("UsersConnected", connectedUsers);
    });

    socket.on("disconnect", async () => {
      connectedUsers = connectedUsers.filter(
        (user) => user.socketId !== socket.id
      );
      socket.broadcast.emit("UsersConnected", connectedUsers);
    });

    socket.on("userOnCall", (username) => {
      connectedUsers = connectedUsers.map((user) => {
        if (user.username === username) {
          return { ...user, isOnCall: true };
        }
        return user;
      });
      socket.broadcast.emit("UsersConnected", connectedUsers);
    });

    socket.on("userActive", (username) => {
      connectedUsers = connectedUsers.map((user) => {
        if (user.username === username) {
          return { ...user, isOnCall: false };
        }
        return user;
      });
      socket.broadcast.emit("UsersConnected", connectedUsers);
    });

    socket.on("callUser", ({ from, to, signal }) => {
      io.to(to).emit("callUser", { from, signal });
    });
    socket.on("answerCall", ({ to, signal }) => {
      io.to(to).emit("callAccepted", signal);
    });
    socket.on("refuseCall", ({ to }) => {
      io.to(to).emit("callRefused");
    });
    socket.on("endCall", ({ to }) => {
      io.to(to).emit("callEnded");
    });
  });

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  return { server, app };
}

startApolloServer();
