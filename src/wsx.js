var binanceWebSocket = null;
var _ontrades = () => {};
var ready = false;
var currentSyms = []; // Store the current symbol and interval

function init(syms) {
  
  startWebSocket(syms);
}


function startWebSocket(syms) {
  const symbol = syms[0];
  const interval = syms[1];
  const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;

  // Close the existing WebSocket (if any) before starting a new one

  binanceWebSocket = new WebSocket(url);
  binanceWebSocket.onmessage = function (event) {
    try {
      const message = JSON.parse(event.data);
      if (message.e === "kline") { // Use === for comparison instead of =
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
    ready = false;
    // Handle reconnection if needed
  };
  binanceWebSocket.onerror = function (e) {
    console.log("WebSocket error:", e);
    // Handle error if needed
  };

  // Store the current symbol and interval in the global variable
  currentSyms = syms;
}

function closeWebSocket() {
  if (binanceWebSocket) {
    binanceWebSocket.close();
  }
}

function stopListening() {
  closeWebSocket();
  ready = false;

}

function reconnectWebSocket() {
  if (!ready) {
    // If WebSocket is not ready, try reconnecting after a short delay (e.g., 5 seconds)
    setTimeout(() => {
      startWebSocket(currentSyms);
    }, 5000);
  }
}

export default {
  init,
  set ontrades(val) {
    _ontrades = val;
  },
  stopListening,
  reconnectWebSocket
};
