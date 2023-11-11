import dotenv from "dotenv";
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./Router";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log("What is socket: ", socket);
  console.log("Socket is active for connection.");

  socket.on("chat", (payload) => {
    console.log("What is payload", payload);
    io.emit("chat", payload);
  });
});

httpServer.listen(process.env.PORT || 8080, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}/`);
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Connection with DB established successfully!");
});
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use(process.env.BASE_URL, router());
