import "./style.css";
import { NightVision } from "night-vision";
import { DataLoader } from "./dataLoader.js";
import wsx from "./wsx.js";
import sampler from "./ohlcvSampler.js";
import ovData1 from "./overlay-data.json";
import smaData from "./sma-data.json"
import rsiData from "./rsi-data.json"
import generateSmaMockData from "./mock_sma_generator"
import generateRsiMockData from "./mock_rsi_generator"


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
<button id="overlay1">Add Pane</button>
<button id="sma1">add sma</button>
<button id="rsi1">add rsi</button>
<div id="chart-container"></div>
`;


function el(id) {
  return document.getElementById(id);
}
function onbtn() {
  let overlays = chart.data.panes[0].overlays;
  overlays.push(ovData1);
}
function addRsi() {
  const rsiMockData = generateRsiMockData(20)
  rsiData.data = rsiMockData
  chart.data.panes.push({
    settings:{},
    overlays:[rsiData]
  })
  chart.update()
}
function addSma() {
  const smaMockData = generateSmaMockData(20)
  smaData.data  = smaMockData
  let overlays = chart.data.panes[0].overlays;
  overlays.push(smaData);
  chart.update()

}
overlay1.addEventListener("click",onbtn)
sma1.addEventListener("click",addSma)
rsi1.addEventListener("click",addRsi)


let chart = new NightVision("chart-container", {
  autoResize: false,
  colors: {
    back: "#111113",
    grid: "#2e2f3055"
  }
});
el("intervalSelect").addEventListener("change", () => {
  const selectedInterval = document.getElementById("intervalSelect").value;
  interval = selectedInterval;
  dl.updateInterval(interval)
  dl.load((data) => {
    chart.data = data;
    el("loading").hidden = true;
    chart.fullReset()
  });
});
let interval = '1m'
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
    volume: d.volume
  };
  if (sampler(data, trade,interval)) {
    chart.update("data"); // New candle
  } else {
    chart.update(); // Candle update
  }
};

// Refernce for experiments
window.chart = chart;
