import type {
  Device,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/types";

import { create } from "zustand";

interface UserMediaSoupInterface {
  params: {};
  device: Device | null;
  rtpCapabilities: RtpCapabilities | null;
  producerTransport: Transport | null;
  consumerTransport: Transport | null;
  setParams: (params: any) => void;
  setDevice: (device: Device) => void;
  setRtpCapabilities: (rtpCapabilities: RtpCapabilities) => void;
  setProducerTransport: (transport: Transport) => void;
  setConsumerTransport: (trasnport: Transport) => void;
}

const useMediaSoupState = create<UserMediaSoupInterface>((set) => ({
  params: {
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" }, // Lowest quality layer
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" }, // Middle quality layer
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" }, // Highest quality layer
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 }, // Initial bitrate
  },
  device: null,
  rtpCapabilities: null,
  producerTransport: null,
  consumerTransport: null,
  setParams: (value: any) => set({ params: value }),
  setDevice: (value: Device) => set({ device: value }),
  setRtpCapabilities: (value: RtpCapabilities) =>
    set({ rtpCapabilities: value }),
  setProducerTransport: (value: Transport) => set({ producerTransport: value }),
  setConsumerTransport: (value: Transport) => set({ consumerTransport: value }),
}));

export default useMediaSoupState;
