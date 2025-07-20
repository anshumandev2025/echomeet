import { Socket } from "socket.io";
import mediasoup, { types as msTypes } from "mediasoup";
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
    rtcMinPort: 30000,
    rtcMaxPort: 30100,
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
  callback: any
) => {
  const router = routers[roomId];
  const transport = await createWebRtcTransport(router);
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
  callback: any
) => {
  try {
    const { roomId } = socketToUser[socket.id];
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
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });
  } catch (err) {
    console.error("Error during consume:", err);
    callback({ error: "Internal server error during consume" });
  }
};
async function createWebRtcTransport(
  router: msTypes.Router
): Promise<msTypes.WebRtcTransport> {
  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp: "http://127.0.0.1:3000" }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    appData: {}, // can set direction here: send / recv
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
