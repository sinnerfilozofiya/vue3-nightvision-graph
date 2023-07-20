<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1><b>
        Night Vision Charts
        Time-series <br>candlestick charts for PROS.,<br>

        <a href="https://nightvision.dev/" target="_blank" rel="noopener">Project website</a>.
      </b></h1>
    <ul>

      <li><a href="https://nightvision.dev/" target="_blank" rel="noopener">pepe website</a></li>
      <li><a href="https://github.com/project-nv/night-vision" target="_blank" rel="noopener">github</a></li>
    </ul>

  </div>
  <div id="chart2"></div>
  <div class="button-group">
    <button id="btn1">Add Pane</button>
    <button id="btn2">Add Overlay</button>
    <button id="btn3">Hide Overlays</button>
  </div>
</template>


<script>

import { NightVision } from 'night-vision'
import data from "./data-1.json";
import ovData1 from "./overlay-data-1.json";
import ovData2 from "./overlay-data-2.json";

export default {
  mounted() {

    function el(id) {
      return document.getElementById(id);
    }

    let chart2 = new NightVision("chart2", {
      height:1000,
      width: 1000,
      data,
      autoResize: true,
      colors: { back: "#111113", grid: "#2e2f3055" },
    });


    // Add/remove pane
    function onButton1() {
      if (chart2.data.panes.length <= 1) {
        chart2.data.panes.push({
          settings: {},
          overlays: [ovData2]
        });
        el("btn1").innerHTML = "Remove Pane";
      } else {
        chart2.data.panes.pop();
        el("btn1").innerHTML = "Add Pane";
      }
      chart2.update(); // Need to call to apply changes
    }

    // Add/remove overlay
    function onButton2() {
      let overlays = chart2.data.panes[0].overlays;
      if (overlays.length <= 2) {
        overlays.push(ovData1);
        el("btn2").innerHTML = "Remove Overlay";
      } else {
        overlays.pop();
        el("btn2").innerHTML = "Add Overlay";
      }
      chart2.update(); // Need to call to apply changes
    }

    // Show/hide overlays
    function onButton3() {
      if (el("btn3").innerHTML === "Hide Overlays") {
        var flag = false;
        el("btn3").innerHTML = "Show Overlays";
      } else {
        flag = true;
        el("btn3").innerHTML = "Hide Overlays";
      }
      chart2.hub.allOverlays().forEach((x, i) => {
        if (i === 0) return; // Except the main
        x.settings.display = flag;
      });
      // Here we have to call one more update
      // (for the legend)
      chart2.update();
      chart2.update("legend");
    }


    el("btn1").onclick = onButton1;
    el("btn2").onclick = onButton2;
    el("btn3").onclick = onButton3;

    // Refernce for experiments
    window.chart = chart2;





  },
};

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
