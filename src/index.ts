import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import router from "./Router";
import path from "path";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const httpServer = http.createServer(app);

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
  console.log(`⚙️  Server is running on http://localhost:${process.env.PORT}/`);
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("☘️  Mongo: Connection with DB established successfully!");
});
mongoose.connection.on("error", (error: Error) => console.log(error));

// swaggerDocs(app, <number>port);
app.use(process.env.BASE_URL, router());
