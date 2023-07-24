// Replace the WebSocket related code with Binance WebSocket API code
var binanceWebSocket = null;
var _ontrades = () => {};
var ready = false;

function init(syms) {
  if (ready) return;
  startWebSocket(syms);
}

function startWebSocket(syms) {
  console.log(syms)
  const symbol = syms[0];
  const interval = syms[1];
  const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;

  binanceWebSocket = new WebSocket(url);
  binanceWebSocket.onmessage = function (event) {
    try {
      const message = JSON.parse(event.data);
      if (message.e = "kline") {
        const klineData = message.k;
        _ontrades({
          price: parseFloat(klineData.c),
          volume: parseFloat(klineData.v)
        });
      }
    } catch (e) {
      console.log(e.toString());
    }
  };
  binanceWebSocket.onopen = function () {
    console.log("WebSocket: opened");
    ready = true;
  };
  binanceWebSocket.onclose = function () {
    console.log("WebSocket: closed");
    // Handle reconnection if needed
    // Implement the reconnection logic here (similar to the one in the Python code)
  };
  binanceWebSocket.onerror = function (e) {
    console.log("WebSocket error:", e);
    // Handle error if needed
  };
}

export default {
  init,
  set ontrades(val) {
    _ontrades = val;
  },
};
