import { types as msTypes } from "mediasoup";
type RoomUsers = {
  [roomId: string]: Set<string>; // roomId -> Set of usernames
};

type SocketToUser = {
  [socketId: string]: { userName: string; roomId: string };
};

export const roomUsers: RoomUsers = {};
export const socketToUser: SocketToUser = {};

export const routers: Record<string, msTypes.Router> = {};
export const peerTransports: Record<string, msTypes.WebRtcTransport[]> = {};
export const producers: Record<string, msTypes.Producer[]> = {};
export const consumers: Record<string, msTypes.Consumer[]> = {};
