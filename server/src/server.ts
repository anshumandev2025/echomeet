import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
// import http from "http";
import https from "https";
import fs from "fs";
import { disconnectHandler, joinRoom } from "./socket/roomEvents";
import {
  connectTransport,
  createTransport,
  getRTPCapabilities,
  handleConsume,
  handleGetAllProducers,
  handleNewMessage,
  handlePausedProducerAudio,
  handlePausedProducerVideo,
  handleProduce,
  handleResumeProducerAudio,
  handleResumeProducerVideo,
  initMediasoupWorker,
} from "./socket/mediaEvents";
import { types as msTypes } from "mediasoup";
dotenv.config();
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
    socket.on("resume-producer-video", (socketId) => {
      handleResumeProducerVideo(socketId, socket);
    });
    socket.on("paused-producer-video", (socketId) => {
      handlePausedProducerVideo(socketId, socket);
    });

    socket.on("paused-producer-audio", (socketId) => {
      handlePausedProducerAudio(socketId, socket);
    });

    socket.on("resume-producer-audio", (socketId) => {
      handleResumeProducerAudio(socketId, socket);
    });
    socket.on("get-all-producers", ({ socketId }, callback) =>
      handleGetAllProducers(socketId, callback)
    );
    socket.on(
      "send-new-message",
      ({ roomId, userName, newMessage, timeStamp }) =>
        handleNewMessage(roomId, userName, newMessage, timeStamp, socket)
    );
    socket.on("disconnect", () => disconnectHandler(socket));
  });
  app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
  });
  return server;
};
export default connectToServer;
