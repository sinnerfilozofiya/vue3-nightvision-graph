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
  <div class="button-group">
  <button id="loading">Loading...</button>
</div>
<div id="chart-container"></div>
<button id="measurebutton">measure some stuff  !! </button>
<button id="trendlinebutton">draw me a line</button>
<button id="clearButton">clear lines</button>

<label for="intervalSelect">time frame:</label>
<select id="intervalSelect">
  <option value="1m">1 minutes</option>
  <option value="5m">5 minutes</option>
  <option value="15m">15 minutes</option>
  <option value="30m">30 minutes</option>
</select>

<label for="pairselect">select a pair:</label>
<select id="pairselect">
  <option value="BTCUSDT">BITCOIN</option>
  <option value="ETHUSDT">ETHERUM</option>
  <option value="APEUSDT">MONKE COIN</option>
</select>
</template>


<script>

import { NightVision } from 'night-vision'

import { DataLoader, rsi_indicator , bb_indicator , ema_indicator} from "./dataLoader.js";
import wsx from "./wsx.js";
import sampler from "./ohlcvSampler.js";

export default {
  mounted() {
    function el(id) {
  return document.getElementById(id);
}

el("trendlinebutton").addEventListener('click', () => {
  // Modify the values of the list items here
    chart.data.panes[0].overlays[5].props.state_manager= true
    chart.update("data")
});
el("clearButton").addEventListener('click', () => {
  // Modify the values of the list items here
    chart.data.panes[0].overlays[5].props.clear= true
    chart.update("data")
});
el("measurebutton").addEventListener('click', () => {
  // Modify the values of the list items here
    chart.data.panes[0].overlays[4].props.state_manager= true
    chart.update("data")
});


let chart = new NightVision("chart-container", {
  autoResize: true,
  height:500,
  width:1500,
  colors: {
    back: "#111113",
    grid: "#2e2f3055"
  }
});
chart.se.uploadAndExec();


let interval = '1m'
let pair = 'BTCUSDT'

el("intervalSelect").addEventListener("change", () => {
  interval = document.getElementById("intervalSelect").value;
  dl.updateInterval(interval)
  dl.load((data) => {
    chart.data = data;
    for (let i = 0; i < chart.data.panes.length; i++) {
      chart.data.panes[i].settings.scales={A:{precision: 2}}
    }
    el("loading").hidden = true;
    chart.fullReset()
  });
});


let dl = new DataLoader(pair,interval);

// Load the first piece of the data
dl.load((data) => {
  chart.data = data;
  for (let i = 0; i < chart.data.panes.length; i++) {
    chart.data.panes[i].settings.scales={A:{precision: 2}}
  }
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
      // Yo need to update "range"
      // when the data range is changed

      chart.data.panes[0].overlays[1].data=data
      chart.data.panes[0].overlays[6].data=data
      chart.data.panes[0].overlays[2].data=bb_indicator(data)
      chart.data.panes[0].overlays[3].data=ema_indicator(data)
      chart.data.panes[1].overlays[0].data=rsi_indicator(data)

      chart.update("data");
      el("loading").hidden = true;
    });
  }
}


chart.events.on("app:$range-update", loadMore);

setInterval(loadMore, 500);

wsx.init([pair.toLowerCase(),interval]);
wsx.ontrades = (d) => {
  if (!chart.hub.mainOv) return;
  let data = chart.hub.mainOv.data;
  let trade = {
    price: d.price,
    volume: d.volume
  };
  if (sampler(data, trade,interval)) {
    chart.data.panes[0].overlays[1].data=data
    chart.data.panes[0].overlays[2].data=bb_indicator(data)
    chart.data.panes[0].overlays[3].data=ema_indicator(data)
    chart.data.panes[1].overlays[0].data=rsi_indicator(data)
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
    for (let i = 0; i < chart.data.panes.length; i++) {
      chart.data.panes[i].settings.scales={A:{precision: 2}}
    }
    el("loading").hidden = true;
    chart.fullReset()
  });
  wsx.stopListening()
  wsx.init([selectpair.toLowerCase(),interval]);
});

chart.se.uploadAndExec()
window.chart=chart;


















chart.scripts=[
  
  `
  // Navy ~ 0.1-lite
[OVERLAY name=Custom, ctx=Canvas, author=ChartMaster, version=1.0.0]


draw(ctx) {
ctx.lineWidth = 1;
const layout = $core.layout;
const data = $core.data; // Full dataset
const view = $core.view; // Visible view



const image = new Image();
image.src = "./assets/1.gif";

const width = 50; // Replace with the desired width
const height = 50; // Replace with the desired height
let xxx = layout.time2x(data[data.length - 1][0]+600000)
let yyy =ctx.canvas.height -80

ctx.drawImage(image,xxx, 0, width, height);
ctx.fillText($props.special_text,xxx, 0);


ctx.strokeStyle = "white";
ctx.lineWidth = 2;

const starttime = 1690959300000;
const endtime = 1690960800000;
let startIndex = null;
let endIndex = null;
let woaaa = null;

for (let i = 0; i < data.length; i++) {
  if (data[i][0] === starttime) {
    startIndex = i;
  }
  if (data[i][0] === endtime) {
    endtIndex = i;
  }
  if (data[i][0] === 1690662000000) {
    woaaa = i;
  }
  if (data[i][0] === 1690738140000) {
    woaaa = i;
  }
}

if (startIndex !== -1) {
  ctx.beginPath();
  ctx.moveTo(layout.time2x(data[startIndex][0]), layout.value2y(data[startIndex][4])); // Starting point (x, y)
  ctx.lineTo(layout.time2x(data[data.length - 1][0]), layout.value2y(data[data.length - 1][4])); // Ending point (x, y)
  ctx.stroke();
  ctx.closePath();




  ctx.beginPath();
  ctx.moveTo(layout.time2x(data[woaaa][0]), layout.value2y(data[woaaa][4])); // Starting point (x, y)
  ctx.lineTo(layout.time2x(data[endtIndex][0]), layout.value2y(data[data.length - 1][4])); // Ending point (x, y)
  ctx.stroke();
  ctx.closePath();
}


}

console.log($props.teset_function("NIGGER"))

mousemove(event){}


yRange(hi, lo) => [
Math.max(hi, $props.upperBand),
Math.min(lo, $props.lowerBand)
]


legend ()=> null
  `,


  //TREND LINE DRAWING TOOL
`
// Navy ~ 0.1-lite
// <ds>Time & value measurment tool [indicator BUTON + Click]</ds>

[OVERLAY name=TrendLineTool, ctx=Canvas, verion=1.0.1, author=GPT4]

let lines = []; // Array to store the lines
let pin1 = null;
let pin2 = null;
let tempPin2 = null; // Temporary pin2 while drawing
let state = 'idle';

draw(ctx) {
  const layout = $core.layout;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  lines.forEach(line => {
      const x1 = layout.time2x(line.pin1.t);
      const x2 = layout.time2x(line.pin2.t);
      const y1 = layout.value2y(line.pin1.v);
      const y2 = layout.value2y(line.pin2.v);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();

  });

  if ($props.clear === true){
    lines =[]
  $props.clear= false;
  }

  // Draw the temporary line while drawing
  if (state === 'drawing' && pin1 && tempPin2) {
      const x1 = layout.time2x(pin1.t);
      const x2 = layout.time2x(tempPin2.t);
      const y1 = layout.value2y(pin1.v);
      const y2 = layout.value2y(tempPin2.v);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();



  }
}

mousedown(event) {
  const layout = $core.layout;
  if (state === 'idle' && $props.state_manager) {
      // Create the first pin
      pin1 = {
          t: $core.cursor.time,
          v: layout.y2value(event.layerY)
      };
      tempPin2 = { ...pin1 };
      state = 'drawing';
      $props.state_manager = false;
  } else if (state === 'drawing') {
      // Finish drawing the line and add it to the 'lines' array
      lines.push({ pin1, pin2: tempPin2 });
      state = 'finished';
      pin1 = null;
      pin2 = null;
      tempPin2 = null;
  } else if (state === 'finished') {
      state = 'idle';
  }
  $events.emitSpec('chart', 'update-layout');
}

mousemove(event) {
  if (state === 'drawing') {
      const layout = $core.layout;
      // Update the temporary pin2 while drawing
      tempPin2 = {
          t: $core.cursor.time,
          v: layout.y2value(event.layerY)
      };
  }
}
yRange(hi, lo) => [
Math.max(hi, $props.upperBand),
Math.min(lo, $props.lowerBand)
]

legend () => null
`
,
//Measurement tool

`// Navy ~ 0.1-lite
// <ds>Time & value measurment tool [ measure button + Click]</ds>

[OVERLAY name=MeasureTool, ctx=Canvas, verion=1.0.0]

let pin1 = null 
let pin2 = null 
let shift = false
let state = 'idle'

draw(ctx) {
  const layout = $core.layout 

  if (pin1 && pin2) {
      const x1 = layout.time2x(pin1.t) // time to x coordinate
      const x2 = layout.time2x(pin2.t) // time to x coordinate
      const y1 = layout.value2y(pin1.v) // value to y coordinate
      const y2 = layout.value2y(pin2.v) // value to y coordinate

       // change fill color based on percentage
      let color = percent() >= 0 ? '#3355ff' : '#ff3333';
      ctx.fillStyle = color + '33';
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

      // draw arrows in the middle of rectangle
      let midX = (x1 + x2) / 2;
      let midY = (y1 + y2) / 2;
      $lib.drawArrow(ctx, midX, y1, midX, y2, color, Math.abs(y2 - y1) > 42); 
      $lib.drawArrow(ctx, x1, midY, x2, midY, color, Math.abs(x2 - x1) > 42);  

      // draw rounded rectangle with text
      const text1 = \`\${deltaValue().toFixed(2)} (\${percent().toFixed(2)}%)\`;
      const text2 = \`\${bars()} bars, \${timeText()}\`;
      const text = \`\${text1}\\n\${text2}\`;
      const textWidth = ctx.measureText(text).width;
      
      const padding = 10;
      const mainRectCenterX = (x1 + x2) / 2; // calculate center of the main rectangle
      const roundRectX = mainRectCenterX - textWidth / 2 - padding; // center the text rectangle relative to the main rectangle
      const roundRectWidth = textWidth + 2 * padding;
      const roundRectHeight = 50;  // adjust as needed
      const roundRectY = percent() > 0 ? Math.min(y1, y2) - roundRectHeight - padding : Math.max(y1, y2) + padding;
      const roundRectRadius = 5;   // adjust as needed
      ctx.fillStyle = color + 'cc';
      $lib.roundRect(ctx, roundRectX, roundRectY, roundRectWidth, roundRectHeight, roundRectRadius);

      // draw text
      ctx.fillStyle = '#ffffffcc' // color;
      ctx.font = $lib.rescaleFont($core.props.config.FONT, 14);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text1, roundRectX + roundRectWidth / 2, roundRectY + roundRectHeight / 4);
      ctx.fillText(text2, roundRectX + roundRectWidth / 2, roundRectY + 3 * roundRectHeight / 4);
    
  }
}

// Calculate the percentage of the are between pins v-values
// assuming that pin2 is above pin1 equals positive value
// and negative otherwise
percent() {
  if (pin1 && pin2) {
      let delta = 100 * (pin2.v - pin1.v)
      if (delta > 0) {
          return delta / pin1.v
      } else {
          return delta / pin2.v
      }
  }
  return 0
}

// Calculate delta time between pins t-values
// assuming that pin2 on the right of pin1 equals positive value
// and negative otherwise
deltaTime() {
  if (pin1 && pin2) {
      return pin2.t - pin1.t
  }
  return 0
}

// Calculate delta value between pins v-values
// assuming that pin2 is above pin1 equals positive value
// and negative otherwise
deltaValue() {
  if (pin1 && pin2) {
      return pin2.v - pin1.v
  }
  return 0
}

// Delta time in bars
bars() {
  let data = $core.hub.mainOv.dataSubset
  if (pin1 && pin2) {
      const layout = $core.layout
      const bars = data.filter(bar => {
          return bar[0] >= Math.min(pin1.t, pin2.t) && bar[0] <= Math.max(pin1.t, pin2.t)
      });
      let count = bars.length - 1; // reduce the count by 1
      return pin2.t < pin1.t ? -count : count; // make it negative if pin2.t < pin1.t
  }
  return 0
}

// Delta time in text format
timeText() {
  let deltaTimeMs = deltaTime();  // returns delta time in milliseconds
  let timeFrameMs = $core.props.timeFrame;  // returns current chart timeframe in milliseconds

  let negative = deltaTimeMs < 0;
  deltaTimeMs = Math.abs(deltaTimeMs);

  let minutes = Math.floor((deltaTimeMs / (1000 * 60)) % 60);
  let hours = Math.floor((deltaTimeMs / (1000 * 60 * 60)) % 24);
  let days = Math.floor(deltaTimeMs / (1000 * 60 * 60 * 24));

  let result = "";
  if (days > 0) {
      result += days + "d ";
  }
  if ((hours > 0 || days > 0) && hours !== 0) {
      result += hours + "h ";
  }
  if (minutes > 0 && timeFrameMs < 60 * 60 * 1000 && minutes !== 0) {
      result += minutes + "m";
  }

  return (negative ? '-' : '') + result.trim();
}



keydown(event) {
  if (event.key === 'Shift') {
      shift = true
  }
}

keyup(event) {
  if (event.key === 'Shift') {
      shift = false
  }
}

mousedown(event) {
const layout = $core.layout 
if (state === 'idle' ) {
    if($props.state_manager || shift){        // Create the first pin 
        pin1 = {
            t: $core.cursor.time,
            v: layout.y2value(event.layerY)
        }
        pin2 = { ...pin1 }
        state = 'drawing'
        $props.state_manager = false
    }
} 

else if (state === 'drawing') {
    state = 'finished'
} else if (state === 'finished') {
    state = 'idle'
    pin1 = null 
    pin2 = null 
}
$events.emitSpec('chart', 'update-layout')
}
mousemove(event) {
  if (state === 'drawing') {
      const layout = $core.layout 
      // Create the second pin 
      pin2 = {
          t: $core.cursor.time,
          v: layout.y2value(event.layerY)
      }
  }
}

// Disable legend by returning null
legend() => null
`

,
//BUILT IN EMA
`
// NavyJS ~ 0.1-lite

// <ds>Single spline</ds>
// Format: [<timestamp>, <number>]

[OVERLAY name=EMA, ctx=Canvas, version=1.1.0]

// Define new props
prop('color', { type: 'color', def: '#31ce31' })
prop('lineWidth', { type: 'number', def: 1 })
prop('dataIndex', { type: 'integer', def: 1 })


draw(ctx) {
  document.getElementById("submitButton").addEventListener('click', () => {
    const numberInput = document.getElementById("numberInput");
    ema_lenght = parseFloat(numberInput.value);
    $props.prop_ema_length = ema_lenght  

  });
    ctx.lineWidth = $props.lineWidth
    ctx.lineJoin = "round"
    ctx.strokeStyle = "white"
    ctx.beginPath()
    const layout = $core.layout
    let data = $props.ema($core.data , $props.prop_ema_length )// Full dataset
    const view = $core.view // Visible view
    const idx = $props.dataIndex
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let p = data[i]
        let x = layout.ti2x(p[0], i)
        let y = layout.value2y(p[idx])
        ctx.lineTo(x, y)
    }
    ctx.stroke()
}

// Price label + Scale symbol + price line
/*valueTracker(x) => {
    show: true,
    symbol: $core.src.name,
    line: true,
    color: $props.color,
    value: x[$props.dataIndex]
}*/

preSampler(x) => [x[$props.dataIndex]]

// Map data item to OHLC (for candle magnets etc.)
// Here we simulate a candle with 0 height
ohlc(x) => Array(4).fill(x[$props.dataIndex])

yRange() {
    let data = $core.hub.ovDataSubset($core.paneId, $core.id)
    let di = $props.dataIndex
    let len = data.length
    var h, l, high = -Infinity, low = Infinity
    for(var i = 0; i < len; i++) {
        let point = data[i][di]
        if (point > high) high = point
        if (point < low) low = point
    }
    return [high, low]
}

// Legend, defined as pairs [value, color]



legendHtml(x, prec, f) => \`
<span class="nvjs-ll-value">\${f(x[1])}</span>
<label for="numberInput">length:</label>
<input type="number" id="numberInput"  placeholder=\${$props.prop_ema_length}  style="width: 35px; height: 20px; font-size: 12px;">
<button id="submitButton" >Submit</button>



\`

`
,
//BUILT IN BOOLNGERBANDS

`

`
]



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
