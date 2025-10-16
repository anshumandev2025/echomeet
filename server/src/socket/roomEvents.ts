import { Socket } from "socket.io";
import { roomUsers, socketToUser } from "./roomState";
import { cleanupPeer } from "./mediaEvents";

export const joinRoom = (
  socket: Socket,
  { roomId, userName }: joinRoomType
) => {
  console.log(
    `User ${userName} with socket it ${socket.id} joining room ${roomId}`
  );
  socket.join(roomId);
  if (!roomUsers[roomId]) {
    roomUsers[roomId] = new Set();
  }
  roomUsers[roomId].add(userName);
  socketToUser[socket.id] = { userName, roomId };
  socket.to(roomId).emit("user-joined", {
    userName,
    socketId: socket.id,
  });
};

export const disconnectHandler = (socket: Socket) => {
  const userData = socketToUser[socket.id];
  cleanupPeer(socket.id);
  if (userData) {
    const { roomId, userName } = userData;

    // Remove user from room
    roomUsers[roomId]?.delete(userName);

    // Cleanup if room is empty
    if (roomUsers[roomId]?.size === 0) {
      delete roomUsers[roomId];
    }

    // Remove socket mapping
    delete socketToUser[socket.id]; // Notify room
    socket.to(roomId).emit("user-left", {
      userName,
      socketId: socket.id,
    });

    console.log(`User ${userName} disconnected from room ${roomId}`);
  }
};
