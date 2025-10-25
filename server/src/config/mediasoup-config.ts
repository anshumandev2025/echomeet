import { RtpCodecCapability } from "mediasoup/node/lib/types";

export const mediasoupConfig = {
  // 🔐 Server config
  port: 3000,

  // ⚙️ Mediasoup worker settings
  numWorkers: Object.keys(require("os").cpus()).length,
  minPort: 40000,
  maxPort: 49999,

  // 📡 WebRTC transport settings
  transportOptions: {
    listenIps: [
      { ip: "0.0.0.0", announcedIp: "127.0.0.1" }, // replace with your public IP if deployed
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000,
    maxIncomingBitrate: 1500000,
  },

  // 🎙️ Media codecs (these match most browsers)
  mediaCodecs: <RtpCodecCapability[]>[
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {},
    },
    {
      kind: "video",
      mimeType: "video/H264",
      clockRate: 90000,
      parameters: {
        "packetization-mode": 1,
        "level-asymmetry-allowed": 1,
        "profile-level-id": "42e01f",
      },
    },
  ],
};
