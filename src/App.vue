<template>
  <div id="app">
    <div class="button-group">
      <button id="loading">Loading...</button>
    </div>
    <div class="main-container">
      <!-- button div -->
      <div class="buttons-container">


       
        <select style="margin-right: 1%;" id="pairselect">
          <option value="BTCUSDT">Bitcoin</option>
          <option value="ETHUSDT">Ethereum</option>
          <option value="APEUSDT">Monke Coin</option>
        </select>


        
        <select style="margin-right: 1%;" id="intervalSelect">
          <option value="1m">1M</option>
          <option value="5m">5M</option>
          <option value="15m">15M</option>
          <option value="30m">30M</option>
        </select>



        
          
          <select  style="margin-right: 1%;"  id="indicatorDropdown">
            <option value="" disabled selected>Select an Indicator</option>
            <option value="ema_ind">Exponential Moving Average (EMA)</option>
            <option value="rsi_ind">Relative Strength Index (RSI)</option>
          </select>
        
        
          <button style="margin-right: 1%;" @click="measurebutton">Measure</button>
          <button style="margin-right: 1%;" @click="trendlinebutton">Trendline</button>
          <button style="margin-right: 1%;" @click="clearButton">Clear Lines</button>
        
      </div>
      <!-- the chart div -->
      <div id="chart-container"></div>
    </div>
  </div>
</template>

<script >

import { NightVision } from "night-vision";
import { DataLoader, rsi_indicator, bb_indicator } from "./components/dataLoader.js";
import wsx from "./components/wsx.js";
import sampler from "./components/ohlcvSampler.js";
import { RSI, BollingerBands, EMA } from '@debut/indicators';
import { custom_scripts } from './components/chart_scripts';
export default {
  data () {return{
      charthight:500
    }
  },
  methods: {
    measurebutton(){
      // Modify the values of the list items here
      chart.data.panes[0].overlays[3].props.state_manager = true
      chart.update("data")
    },
    trendlinebutton(){
      chart.data.panes[0].overlays[4].props.state_manager = true
      chart.update("data")
    },
    clearButton(){
      chart.data.panes[0].overlays[4].props.clear = true
      chart.update("data")
    },
  },
  mounted() {




    let chart = new NightVision("chart-container", {
      autoResize: true,
      config: { MAX_ZOOM: 500},
      scripts: custom_scripts,
      height:this.charthight,
      colors: {
        back: "#111113",
        grid: "#2e2f3055"
      }
    });




    function el(id) {
      return document.getElementById(id);
    }

    let isSwitchOn = true;
    function toggleSwitch() {
      isSwitchOn = true;
    }

    document.addEventListener('legendHtmlUpdate', (event) => {
      const paneid = event.detail.pid;
      const overlayid = event.detail.oid;

      if (isSwitchOn) {
        if (paneid == 0) {
          const overlays = chart.data.panes[paneid].overlays
          overlays.splice(overlayid, 1);
          chart.update("data");
        }
        if (paneid > 0) {
          const overlays = chart.data.panes
          overlays.splice(paneid, 1);
          chart.update("data");
        }
        isSwitchOn = false
      }

      setTimeout(() => {
        toggleSwitch();
      }, 100);

    });



    function addEMA() {
      let ema_object = {
        name: "EMA",
        type: "EMA",
        data: chart.data.panes[0].overlays[0].data,
        props: {
          prop_ema_length: 20,
          ema_color: "#00ffff",
          ema: function (inputList, ema_length = 20) {
            const modifiedList_ema = [];
            const Period = ema_length;
            const ema = new EMA(Period);
            for (let i = 0; i < inputList.length; i++) {
              const ema_val = ema.nextValue(inputList[i][4]);
              modifiedList_ema.push([inputList[i][0], ema_val])
            };
            return modifiedList_ema;
          }
        }
      }
      let overlays = chart.data.panes[0].overlays;

      overlays.push(ema_object);
      chart.update()

    }

    function addRSI() {
      let rsi_object = {
        settings: { scales: { A: { precision: 2 } } },
        overlays: [{
          name: "RSI",
          type: "RSI",
          data: chart.data.panes[0].overlays[0].data,
          props: {
            prop_rsi_length: 30,
            rsi_color: "#00ff00",
            rsi: function (inputList, rsi_length = 20) {
              const modifiedList_rsi = [];
              const Period = rsi_length;
              const rsi = new RSI(rsi_length);
              for (let i = 0; i < inputList.length; i++) {
                const rsi_val = rsi.nextValue(inputList[i][4]);
                modifiedList_rsi.push([inputList[i][0], rsi_val])
              };
              return modifiedList_rsi;
            }
          }
        }]
      }


      chart.data.panes.push(rsi_object)
      chart.update()
    }

    el("indicatorDropdown").addEventListener("change", () => {
      if (el("indicatorDropdown").value === "ema_ind") {
        addEMA()
      } if (el("indicatorDropdown").value === "rsi_ind") {
        addRSI()
      }
      el("indicatorDropdown").value = ""
    });





    let interval = '1m'
    let pair = 'BTCUSDT'

    el("intervalSelect").addEventListener("change", () => {
      interval = document.getElementById("intervalSelect").value;
      dl.updateInterval(interval)
      dl.load((data) => {
        chart.data = data;
        el("loading").hidden = true;
        chart.fullReset()
      });
    });


    let dl = new DataLoader(pair, interval);

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
          data.unshift(...chunk);
          chart.data.panes[0].overlays[0].data = data
          chart.data.panes[0].overlays[1].data = data
          chart.data.panes[0].overlays[2].data = data

          chart.update("data");
          el("loading").hidden = true;
        });
      }
    }


    chart.events.on("app:$range-update", loadMore);

    setInterval(loadMore, 500);

    wsx.init([pair.toLowerCase(), interval]);
    wsx.ontrades = (d) => {
      if (!chart.hub.mainOv) return;
      let data = chart.hub.mainOv.data;
      let trade = {
        price: d.price,
        volume: d.volume
      };
      if (sampler(data, trade, interval)) {
        chart.data.panes[0].overlays[0].data = data
        chart.data.panes[0].overlays[1].data = data
        chart.data.panes[0].overlays[2].data = data

        chart.update("data");
        chart.update("layout");
      } else {
        chart.update();
      }
    };

    el("pairselect").addEventListener("change", () => {
      const selectpair = document.getElementById("pairselect").value;
      pair = selectpair
      dl.updatepair(selectpair)
      dl.load((data) => {
        chart.data = data;
        el("loading").hidden = true;
        chart.fullReset()
      });
      wsx.stopListening()
      wsx.init([selectpair.toLowerCase(), interval]);
    });


    window.chart = chart;
  }

};
</script>









<style scoped>

.main-container {
  width: 100%;
  display: flex;
  flex-direction: column;

}
.buttons-container {
  background-color: transparent;
  flex: 10%; 
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;

  background-color: #f0f0f0;
}
.chart-container {
  flex: 90%; /* 90% height for chart */
  background-color: #ffffff;
}


</style>