import { Socket } from "socket.io";
import { roomTimeStamp, roomUsers, socketToUser } from "./roomState";
import { cleanupPeer } from "./mediaEvents";
export const joinRoom = (
  socket: Socket,
  { roomId, userName, audioEnabled, videoEnabled, isSpeaking }: JoinRoomType
) => {
  console.log(
    `User ${userName} with socket it ${socket.id} joining room ${roomId}`
  );
  socket.join(roomId);
  if (!roomUsers[roomId]) {
    roomUsers[roomId] = new Set();
  }
  roomUsers[roomId].add(socket.id);
  const isHost = Object.keys(socketToUser).length == 0 ? true : false;
  if (isHost) {
    roomTimeStamp[roomId] = { timeStamp: Date.now() };
  }
  socketToUser[socket.id] = {
    userName,
    roomId,
    audioEnabled,
    videoEnabled,
    isSpeaking,
    isHost,
  };
  socket.to(roomId).emit("user-joined", {
    userName,
    socketId: socket.id,
    audioEnabled,
    videoEnabled,
    isSpeaking,
  });
};

export const handleIsHost = (socketId: string, callback: any) => {
  const userData = socketToUser[socketId];
  if (!userData) callback({ error: "socket not found" });
  callback({ host: userData?.isHost || false });
};
export const getRoomTimeStamp = (roomId: string, callback: any) => {
  const result = roomTimeStamp[roomId];
  if (!result) callback({ error: "Room not found" });
  callback({ timestamp: result.timeStamp });
};
export const handleRemoveUser = (
  targetSocketId: string,
  io: any,
  requesterSocket: Socket // who is removing
) => {
  const userData = socketToUser[targetSocketId];
  if (!userData) return;

  const { roomId, userName } = userData;

  // 🔹 Get target socket
  const targetSocket = io.sockets.sockets.get(targetSocketId);
  if (!targetSocket) return;

  // 🔹 Cleanup peer connections
  cleanupPeer(targetSocketId);

  // 🔹 Remove user from room data
  roomUsers[roomId]?.delete(targetSocketId);
  if (roomUsers[roomId]?.size === 0) {
    delete roomUsers[roomId];
  }

  // 🔹 Notify everyone (including sender)
  io.to(roomId).emit("user-left", {
    userName,
    socketId: targetSocketId,
    reason: "remove",
  });

  // 🔹 Force socket to leave room
  targetSocket.leave(roomId);

  // 🔹 Remove mapping
  delete socketToUser[targetSocketId];
  if (Object.keys(socketToUser).length == 0) {
    delete roomTimeStamp[roomId];
  }
  // 🔹 Disconnect that user
  targetSocket.disconnect(true);

  console.log(
    `User ${userName} was removed by ${requesterSocket.id} from room ${roomId}`
  );
};

export const disconnectHandler = (socket: Socket) => {
  const userData = socketToUser[socket.id];
  cleanupPeer(socket.id);
  if (userData) {
    const { roomId, userName, isHost } = userData;

    // Remove user from room
    roomUsers[roomId]?.delete(socket.id);

    // Cleanup if room is empty
    if (roomUsers[roomId]?.size === 0) {
      delete roomUsers[roomId];
    }

    // Remove socket mapping
    delete socketToUser[socket.id]; // Notify room
    if (Object.keys(socketToUser).length == 0) {
      delete roomTimeStamp[roomId];
    }
    socket.to(roomId).emit("user-left", {
      userName,
      socketId: socket.id,
      reason: "leave",
      isHost,
    });

    console.log(`User ${userName} disconnected from room ${roomId}`);
  }
};
