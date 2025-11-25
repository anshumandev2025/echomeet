export const generateRoomName = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  const generateGroup = () =>
    Array.from(
      { length: 3 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");

  return `${generateGroup()}-${generateGroup()}-${generateGroup()}`;
};

export const isValidRoomName = (roomName: string): boolean => {
  const pattern = /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/;
  return pattern.test(roomName.trim());
};
