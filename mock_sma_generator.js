function generateSmaMockData(size) {
  if (size <= 0) {
    throw new Error("Size must be a positive integer.");
  }

  const data = [];
  const currentTime = Date.now();
  const oneMinute = 60000; // 1 minute in milliseconds
  const currentMinute = Math.floor(currentTime / oneMinute) * oneMinute;

  for (let i = 0; i < size; i++) {
    const timestamp = currentMinute - (size - 1 - i) * oneMinute;
    const randomValue = Math.floor(Math.random() * 601) + 29200; // Random number between 29200 and 29800 (inclusive)
    data.push([timestamp, randomValue]);
  }

  return data;
}
export default generateSmaMockData