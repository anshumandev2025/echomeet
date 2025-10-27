import type {
  DtlsParameters,
  IceCandidate,
  IceParameters,
} from "mediasoup-client/types";

export type MediaDeviceType = {
  deviceId: string;
  label: string;
};

export type CreateTransportType = {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
};

export type Participant = {
  id: string;
  name: string;
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSpeaking: boolean;
};
