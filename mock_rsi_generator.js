function generateRsiMockData(size) {
    if (size <= 0) {
      throw new Error("Size must be a positive integer.");
    }
  
    const data = [];
    const currentTime = Date.now();
    const oneMinute = 60000; // 1 minute in milliseconds
    const currentMinute = Math.floor(currentTime / oneMinute) * oneMinute;
  
    for (let i = 0; i < size; i++) {
      const timestamp = currentMinute - (size - 1 - i) * oneMinute; // Subtracting instead of adding
      const randomValue = (Math.random() * 40 + 30).toFixed(2); // Random number between 30 and 70 with two decimal places
      data.push([timestamp, parseFloat(randomValue)]);
    }
  
    return data;
}
export default generateRsiMockData