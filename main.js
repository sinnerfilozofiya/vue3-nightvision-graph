import "./style.css";
import { NightVision } from "night-vision";
import { DataLoader } from "./dataLoader.js";
import sampler from "./ohlcvSampler.js";

document.querySelector("#app").innerHTML = `
<style>
body {
    background-color: #0c0d0e;
}
</style>
<div class="button-group">
  <button id="loading">Loading...</button>
</div>
<div id="chart-container"></div>
`;

function el(id) {
  return document.getElementById(id);
}

let chart = new NightVision("chart-container", {
  height:1000,
  width: 5000,
  autoResize: true,
  colors: {
    back: "#111113",
    grid: "#2e2f3055"
  }
});

let dl = new DataLoader();

// Load the first piece of the data
dl.load((data) => {
  chart.data = data;
  el("loading").hidden = true;
});

// Load deeper into the history
function loadMore() {
  if (!chart.hub.mainOv) return;
  let data = chart.hub.mainOv.data;
  let t0 = data[0][0];
  if (chart.range[0] < t0) {
    el("loading").hidden = false;
    dl.loadMore(t0 - 1, (chunk) => {
      // Add a new chunk at the beginning
      data.unshift(...chunk);
      // Yo need to update "range"
      // when the data range is changed
      chart.update("data");
      el("loading").hidden = true;
    });
  }
}

chart.events.on("app:$range-update", loadMore);

setInterval(loadMore, 500);



// Setup a trade data stream
// (from FTX,)

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

init(["BTC-PERP"]);



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

    _ontrades = (d) => {
      if (!chart.hub.mainOv) return;
      let data = chart.hub.mainOv.data;
      let trade = {
        price: d.price,
        volume: d.price * d.size
      };
      if (sampler(data, trade)) {
        chart.update("data"); // New candle
      } else {
        chart.update(); // Candle update
      }
    };
     
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




// Refernce for experiments
window.chart = chart;
