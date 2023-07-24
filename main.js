import "./style.css";
import { NightVision } from "night-vision";
import { DataLoader } from "./dataLoader.js";
import wsx from "./wsx.js";
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
<label for="intervalSelect">Select Interval:</label>
<select id="intervalSelect">
  <option value="1m">1 minutes</option>
  <option value="5m">5 minutes</option>
  <option value="15m">15 minutes</option>
  <option value="30m">30 minutes</option>
</select>
<div id="chart-container"></div>
`;

function el(id) {
  return document.getElementById(id);
}

let chart = new NightVision("chart-container", {
  autoResize: true,
  colors: {
    back: "#111113",
    grid: "#2e2f3055"
  }
});
document.getElementById("intervalSelect").addEventListener("change", () => {
  const selectedInterval = document.getElementById("intervalSelect").value;
  interval = selectedInterval;
  dl.updateInterval(interval)
  dl.load((data) => {
    chart.data = data;
    el("loading").hidden = true;
  });
});

let interval = '5m'
let dl = new DataLoader(interval);

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

// Load new data when user scrolls left
chart.events.on("app:$range-update", loadMore);

// Plus check for updates every second
setInterval(loadMore, 500);

// Setup a trade data stream
// (from FTX,)
wsx.init(["btcusdt",interval]);
wsx.ontrades = (d) => {
  if (!chart.hub.mainOv) return;
  let data = chart.hub.mainOv.data;
  let trade = {
    price: d.price,
    volume: d.price * d.size
  };
  if (sampler(data, trade,interval)) {
    chart.update("data"); // New candle
  } else {
    chart.update(); // Candle update
  }
};

// Refernce for experiments
window.chart = chart;
