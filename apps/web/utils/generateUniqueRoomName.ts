const generateUniqueRoomKey = (): string => {
  const randomLetters = (length: number): string =>
    Array.from({ length }, () =>
      String.fromCharCode(97 + Math.floor(Math.random() * 26))
    ).join("");

  const part1 = randomLetters(3);
  const part2 = randomLetters(4);
  const part3 = randomLetters(3);

  return `${part1}-${part2}-${part3}`;
};

export default generateUniqueRoomKey;
