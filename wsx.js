var last_event = Infinity;
var ws = null;
var _ontrades = () => {};
var _onready = () => {};
var _onrefine = () => {};
var reconnecting = false;
var ready = false;
var symbols = [];

function now() {
  return new Date().getTime();
}

async function init(syms) {
  if (ready) return;

  symbols = syms;
  start_hf(symbols);

  // If connection error, try again
  setTimeout(() => init(symbols), 10000);
}

function start_hf() {
  // To subscribe to this channel:
  var msg = (sym) => ({
    op: "subscribe",
    channel: "trades",
    market: sym
  });

  ws = new WebSocket(`wss://ftx.com/ws`);
  ws.onmessage = function (e) {
    try {
      let data = JSON.parse(e.data);
      if (!data.data) return print(data);
      switch (data.channel) {
        case "trades":
          for (var d of data.data) {
            d.symbol = data.market;
            _ontrades(d);
          }
          break;
      }
      last_event = now();
    } catch (e) {
      // log
      console.log(e.toString());
    }
  };
  ws.onopen = function () {
    try {
      for (var s of symbols) {
        ws.send(JSON.stringify(msg(s)));
      }
    } catch (e) {
      console.log(e.toString());
    }
  };
  ws.onclose = function (e) {
    switch (e) {
      case 1000:
        console.log("WebSocket: closed");
        break;
    }
    reconnect();
  };
  ws.onerror = function (e) {
    console.log("WS", e);
    reconnect();
  };
}

function reconnect() {
  reconnecting = true;
  console.log("Reconnecting...");
  try {
    ws.close();
    // ws.removeAllListeners();
    setTimeout(() => start_hf(symbols), 1000);
  } catch (e) {
    console.log(e.toString());
  }
}

function print(data) {
  if (data.type === "subscribed") {
    // TODO: refine the chart
    if (reconnecting) {
      _onrefine();
    } else if (!ready) {
      console.log("Stream [OK]");
      _onready();
      ready = true;
      last_event = now();
      setTimeout(heartbeat, 10000);
    }
    reconnecting = false;
  }
}

function heartbeat() {
  if (now() - last_event > 60000) {
    console.log("No events for 60 seconds");
    if (!reconnecting) reconnect();
    setTimeout(heartbeat, 10000);
  } else {
    setTimeout(heartbeat, 1000);
  }
}

console.log(_ontrades)

export const wsx = {
  init,
  reconnect,
  set ontrades(val) {
    _ontrades = val;
  },
  set ready(val) {
    _onready = val;
  }
};
