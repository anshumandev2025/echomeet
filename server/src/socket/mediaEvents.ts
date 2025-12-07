import { Socket } from "socket.io";
import { types as msTypes } from "mediasoup";
import * as mediasoup from "mediasoup";
import {
  consumers,
  peerTransports,
  producers,
  routers,
  socketToUser,
} from "./roomState";
import { mediasoupConfig } from "../config/mediasoup-config";

export async function initMediasoupWorker() {
  const worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
  });

  worker.on("died", () => {
    console.error("Mediasoup worker died!");
    process.exit(1);
  });

  console.log("✅ Mediasoup Worker initialized");
  return worker;
}
export const getRTPCapabilities = async (
  worker: msTypes.Worker,
  roomId: string,
  callback: any
) => {
  if (!routers[roomId]) {
    routers[roomId] = await worker.createRouter({
      mediaCodecs: mediasoupConfig.mediaCodecs,
    });
  }
  callback(routers[roomId].rtpCapabilities);
};

export const createTransport = async (
  socket: Socket,
  roomId: string,
  direction: string,
  worker: msTypes.Worker,
  callback: any
) => {
  let router = routers[roomId];
  if (!router) {
    // Fallback: create router automatically
    console.warn(`Router for room ${roomId} not found. Creating a new one.`);
    router = routers[roomId] = await worker.createRouter({
      mediaCodecs: mediasoupConfig.mediaCodecs,
    });
  }
  const transport = await createWebRtcTransport(router, direction);
  if (!peerTransports[socket.id]) {
    peerTransports[socket.id] = [];
  }
  peerTransports[socket.id].push(transport);
  callback({
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  });
};

export const connectTransport = async (
  socket: Socket,
  transportId: string,
  dtlsParameters: msTypes.DtlsParameters,
  callback: any
) => {
  const transport = getTransport(socket.id, transportId);
  await transport.connect({ dtlsParameters });
  callback("connected");
};

export const handleProduce = async (
  socket: Socket,
  kind: msTypes.MediaKind,
  rtpParameters: msTypes.RtpParameters,
  transportId: string,
  callback: any
) => {
  const transport = getTransport(socket.id, transportId);
  const producer = await transport.produce({ kind, rtpParameters });

  if (!producers[socket.id]) producers[socket.id] = [];
  producers[socket.id].push(producer);

  const { roomId } = socketToUser[socket.id];
  socket.to(roomId).emit("new-producer", {
    socketId: socket.id,
    producerId: producer.id,
    kind,
  });

  callback({ id: producer.id });
};

export const handleConsume = async (
  socket: Socket,
  producerId: string,
  rtpCapabilities: msTypes.RtpCapabilities,
  sockedId: string,
  callback: any
) => {
  try {
    const { roomId, userName, videoEnabled, audioEnabled, isSpeaking } =
      socketToUser[sockedId];
    const router = routers[roomId];

    if (!router.canConsume({ producerId, rtpCapabilities })) {
      return callback({ error: "Cannot consume this producer" });
    }

    const transport = peerTransports[socket.id]?.find(
      (t) => t.appData?.direction === "recv"
    );

    if (!transport) {
      return callback({ error: "Receive transport not found" });
    }

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    });

    // Store the consumer if needed
    if (!consumers[socket.id]) consumers[socket.id] = [];
    consumers[socket.id].push(consumer);
    callback({
      producerInfo: {
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      },
      userInfo: {
        socketId: sockedId,
        userName: userName,
        videoEnabled,
        audioEnabled,
        isSpeaking,
      },
    });
  } catch (err) {
    console.error("Error during consume:", err);
    callback({ error: "Internal server error during consume" });
  }
};

export const handleResumeProducerVideo = (socketId: string, socket: Socket) => {
  // const peerConsumers = consumers[socketId];
  // if (!peerConsumers) return;
  // console.log("consumer resumed");

  // for (const consumer of peerConsumers) {
  //   consumer.resume();
  // }
  const { roomId } = socketToUser[socketId];
  socketToUser[socketId].videoEnabled = true;
  socket.to(roomId).emit("user-resume-video", { socketId });
};

export const handlePausedProducerVideo = (socketId: string, socket: Socket) => {
  // const peerConsumers = consumers[socketId];
  // if (!peerConsumers) return;
  // console.log("consumer paused");
  // for (const consumer of peerConsumers) {
  //   console.log("consumer.id", consumer.id);
  //   consumer.pause();
  // }
  const { roomId } = socketToUser[socketId];
  socketToUser[socketId].videoEnabled = false;
  socket.to(roomId).emit("user-paused-video", { socketId });
};

export const handlePausedProducerAudio = (socketId: string, socket: Socket) => {
  // const peerConsumers = consumers[socketId];
  // if (!peerConsumers) return;
  // console.log("consumer paused");
  // for (const consumer of peerConsumers) {
  //   console.log("consumer.id", consumer.id);
  //   consumer.pause();
  // }
  const { roomId } = socketToUser[socketId];
  socketToUser[socketId].audioEnabled = false;
  socket.to(roomId).emit("user-paused-audio", { socketId });
};

export const handleResumeProducerAudio = (socketId: string, socket: Socket) => {
  // const peerConsumers = consumers[socketId];
  // if (!peerConsumers) return;
  // console.log("consumer resumed");

  // for (const consumer of peerConsumers) {
  //   consumer.resume();
  // }
  const { roomId } = socketToUser[socketId];
  socketToUser[socketId].audioEnabled = true;
  socket.to(roomId).emit("user-resume-audio", { socketId });
};
export const handleGetAllProducers = (socketId: string, callback: any) => {
  const user = socketToUser[socketId];
  if (!user) return callback({ producers: [] });

  const roomId = user.roomId;

  const allProducers: any[] = [];

  for (const [peerSocketId, peerProducers] of Object.entries(producers)) {
    // skip own producers
    if (peerSocketId === socketId) continue;

    // skip producers not in same room
    if (socketToUser[peerSocketId]?.roomId !== roomId) continue;

    peerProducers.forEach((p) => {
      allProducers.push({
        socketId: peerSocketId,
        producerId: p.id,
        kind: p.kind,
      });
    });
  }
  callback({ producers: allProducers });
};
export const handleNewMessage = (
  roomId: string,
  userName: string,
  newMessage: string,
  timeStamp: string,
  socket: Socket
) => {
  socket
    .to(roomId)
    .emit("receive-new-message", { userName, newMessage, timeStamp });
};
async function createWebRtcTransport(
  router: msTypes.Router,
  direction: string
): Promise<msTypes.WebRtcTransport> {
  const transport = await router.createWebRtcTransport({
    ...mediasoupConfig.transportOptions,
    appData: { direction }, // can set direction here: send / recv
  });

  return transport;
}

function getTransport(
  socketId: string,
  transportId: string
): msTypes.WebRtcTransport {
  const transport = (peerTransports[socketId] || []).find(
    (t) => t.id === transportId
  );
  if (!transport) throw new Error("Transport not found");
  return transport;
}

export function cleanupPeer(socketId: string) {
  // Close and remove transports
  (peerTransports[socketId] || []).forEach((t) => t.close());
  delete peerTransports[socketId];

  // Close producers
  (producers[socketId] || []).forEach((p) => p.close());
  delete producers[socketId];

  // Close consumers
  (consumers[socketId] || []).forEach((c) => c.close());
  delete consumers[socketId];

  console.log(`🔌 Cleaned up mediasoup resources for socket ${socketId}`);
}
