import { Server as SocketServer } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const httpServer = http.createServer(app);
const io = new SocketServer(httpServer);

io.on("connection", (socket) => {
  console.log(`🚀 New user connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`👋 User disconnected: ${socket.id}`);
  });
});

export default io;
