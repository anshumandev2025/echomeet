import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import https from "https";
import fs from "fs";
import { disconnectHandler, joinRoom } from "./socket/roomEvents";
import {
  connectTransport,
  createTransport,
  getRTPCapabilities,
  handleConsume,
  handleProduce,
  initMediasoupWorker,
} from "./socket/mediaEvents";
import { types as msTypes } from "mediasoup";

const connectToServer = () => {
  const app = express();
  // const server = http.createServer(app);
  const server = https.createServer(
    {
      key: fs.readFileSync("../localhost+1-key.pem"),
      cert: fs.readFileSync("../localhost+1.pem"),
    },
    app
  );
  const io = new Server(server, { cors: { origin: "*" } });
  let worker: msTypes.Worker;
  (async () => {
    worker = await initMediasoupWorker();
  })();
  app.use(cors({ origin: "*" }));
  io.on("connection", (socket) => {
    console.log("Client connected to socket with id ", socket.id);
    socket.on("join-room", (data) => joinRoom(socket, data));

    socket.on("get-rtp-capabilities", ({ roomId }, callback) =>
      getRTPCapabilities(worker, roomId, callback)
    );

    socket.on("create-transport", ({ roomId, direction }, callback) =>
      createTransport(socket, roomId, direction, worker, callback)
    );

    socket.on(
      "connect-transport",
      ({ transportId, dtlsParameters }, callback) =>
        connectTransport(socket, transportId, dtlsParameters, callback)
    );

    socket.on("produce", ({ kind, rtpParameters, transportId }, callback) =>
      handleProduce(socket, kind, rtpParameters, transportId, callback)
    );

    socket.on(
      "consume",
      ({ producerId, rtpCapabilities, socketId }, callback) =>
        handleConsume(socket, producerId, rtpCapabilities, socketId, callback)
    );
    socket.on("disconnect", () => disconnectHandler(socket));
  });
  app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
  });
  return server;
};
export default connectToServer;
