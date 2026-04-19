import { RtpCodecCapability } from "mediasoup/node/lib/types";
import os from "os";

export const mediasoupConfig = {
  // 🔐 Server config
  port: 3000, // your backend port (make sure SG allows this)

  // ⚙️ Mediasoup worker settings
  numWorkers: Object.keys(os.cpus()).length,
  worker: {
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
    logLevel: "warn",
    logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
  },

  // 📡 WebRTC transport settings
  transportOptions: {
    listenIps: [
      {
        ip: "0.0.0.0", // listen on all network interfaces
        announcedIp: process.env.ANNOUNCED_IP,
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000,
    maxIncomingBitrate: 1500000,
  },

  // 🎙️ Media codecs
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
        "profile-level-id": "42e01f",
        "level-asymmetry-allowed": 1,
      },
    },
  ],
};
