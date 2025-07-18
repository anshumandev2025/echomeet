import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
const connectToServer = () => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  app.use(cors({ origin: "*" }));
  io.on("connection", (socket) => {
    console.log("Client connected to socket with id ", socket.id);
  });
  app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
  });
  return server;
};
export default connectToServer;
