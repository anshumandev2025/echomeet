export const generateRoomName = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const isValidRoomName = (roomName: string): boolean => {
  const roomNamePattern = /^[a-z0-9]{8}$/;
  return roomNamePattern.test(roomName.trim());
};
