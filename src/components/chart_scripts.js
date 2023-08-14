
export const custom_scripts = [

    `
    // Navy ~ 0.1-lite
  [OVERLAY name=Custom, ctx=Canvas, author=ChartMaster, version=1.0.0]
  
  
  draw(ctx) {
  ctx.lineWidth = 1;
  const layout = $core.layout;
  const data = $core.data; // Full dataset
  const view = $core.view; // Visible view
  
  
  
  //const image = new Image();
  //image.src = './1.gif';
  //
  //const width = 50; // Replace with the desired width
  //const height = 50; // Replace with the desired height
  //let xxx = layout.time2x(data[data.length - 1][0]+600000)
  //let yyy =ctx.canvas.height -80
  //
  //ctx.drawImage(image,xxx, 0, width, height);
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
  
    //special events
  `
  
  // Navy ~ 0.1-lite
  // <ds>Time & value measurment tool [indicator BUTON + Click]</ds>
  
  [OVERLAY name=specialevent, ctx=Canvas, verion=1.0.1, author=GPT4]
  
  //there has been some speacial events here llolololol!!!
  
  time = $props.time
  
  draw(ctx) {
    const layout = $core.layout;
    const data = $core.data; // Full dataset
    const chartHeight = layout.height; // Height of the chart
  
    // Calculate the x-coordinate for the button based on the last candle data
    const buttonX = layout.time2x($props.time);
  
    const buttonY = chartHeight - 50; // Y-coordinate at the bottom
    const buttonRadius = 20; // Radius of the circular button
  
    ctx.fillStyle = $props.bcolor; // Fill color of the button
    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, 2 * Math.PI); // Draw the circular button
    ctx.fill();
    ctx.closePath();
  
    if ($props.isHovered) {
      // Render the text box above the button when the button is hovered
      //const userInput = $props.textBoxContent;   brings up the text input
      const userInput = "there has been some speacial events here llolololol!!!"
  
      const fontSize = 14; // Font size in pixels
      const textWidth = ctx.measureText(userInput).width;
      const textBoxX = buttonX - textWidth / 2; // Center horizontally
      const textBoxY = buttonY - buttonRadius - fontSize - 10; // Above the button
  
      // Draw the white background for the text box
      ctx.fillStyle = "white"; // Fill color of the text box
      ctx.fillRect(textBoxX, textBoxY, textWidth + 200, fontSize + 30 );
  
      // Draw the text inside the text box
      ctx.fillStyle = "black"; // Text color
      ctx.font = \`\${fontSize}px Arial\`; // Font settings
      ctx.fillText(userInput, textBoxX+1 , textBoxY + fontSize); // Display user input
    }
  }
  
  mousemove(event) {
    const layout = $core.layout;
    const data = $core.data; // Full dataset
    const chartHeight = layout.height; // Height of the chart
  
    // Calculate the x-coordinate for the button based on the last candle data
    const buttonX = layout.time2x($props.time);
  
    const buttonY = chartHeight - 50; // Y-coordinate at the bottom
    const buttonRadius = 20; // Radius of the circular button
  
    const distance = Math.sqrt(
      Math.pow(event.layerX - buttonX, 2) + Math.pow(event.layerY - buttonY, 2)
    );
  
    if (distance <= buttonRadius) {
      $props.bcolor = "#641504"; // Change button color when mouse is over
      $props.isHovered = true; // Set the flag to show the text box
    } else {
      $props.bcolor = "#871C05"; // Restore button color when mouse is not over
      $props.isHovered = false; // Set the flag to hide the text box
    }
  }
  
  mousedown(event) {
    const layout = $core.layout;
    const data = $core.data; // Full dataset
    const chartHeight = layout.height; // Height of the chart
  
    // Calculate the x-coordinate for the button based on the last candle data
    const buttonX = layout.time2x($props.time);
    const buttonY = chartHeight - 50; // Y-coordinate at the bottom
    const buttonRadius = 20; // Radius of the circular button
  
    const distance = Math.sqrt(
      Math.pow(event.layerX - buttonX, 2) + Math.pow(event.layerY - buttonY, 2)
    );
  
    if ($props.isHovered && distance <= buttonRadius) {
      const userInput = prompt("Enter your text:"); // Capture user input
      if (userInput !== null) {
        $props.textBoxContent = userInput; // Store the user input
        $props.isHovered = false; // Hide the text box when button is clicked
        // Other actions you want to perform when the button is clicked
      }
    }
  }
  
  
  
  
  
  
  yRange(hi, lo) => [
  Math.max(hi, $props.upperBand),
  Math.min(lo, $props.lowerBand)
  ]
  
  legend () => null
  
  `
  
    ,
    //BUILT IN EMA
    `
  // NavyJS ~ 0.1-lite
  
  // <ds>Single spline</ds>
  // Format: [<timestamp>, <number>]
  
  [OVERLAY name=EMA, ctx=Canvas, version=1.1.0]
  
  
  prop('color', { type: 'color', def: '#31ce31' })
  prop('lineWidth', { type: 'number', def: 1 })
  prop('dataIndex', { type: 'integer', def: 1 })
  const uniqie_id="string"+\`\${$core.paneId}\${$core.id}\`.toString()
  let color = $props.ema_color
  let ema_period =  $props.prop_ema_length
  draw(ctx) {
  
    document.getElementById("submitButton" + uniqie_id).addEventListener('click', () => {
      const numberInput = document.getElementById("ema" + uniqie_id);
      ema_lenght = parseFloat(numberInput.value);
      $props.prop_ema_length= ema_lenght  
  
    });
  
    document.getElementById("delete" + uniqie_id).addEventListener('click', () => {
      const customevent = new CustomEvent('legendHtmlUpdate', {
        bubbles:true,
        detail: {
          pid: $core.paneId, 
          oid: $core.id
        }
      });
      document.dispatchEvent(customevent);
  
    });
  
  
  
    const colorInput = document.getElementById("colorInput" + uniqie_id);
  
    colorInput.addEventListener("input", function() {
      $props.ema_color = colorInput.value;
    });
  
      ctx.lineWidth = $props.lineWidth
      ctx.lineJoin = "round"
      ctx.strokeStyle = $props.ema_color
      ctx.beginPath()
      const layout = $core.layout
      let data = $props.ema($core.data ,$props.prop_ema_length )// Full dataset
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
  
  yRange() {
    let data = $core.hub.ovDataSubset(0, 0)
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
  
  
  
  
    legendHtml(x, prec, f) {
  
      const layout = $core.layout
      let v = \$core.cursor.getValue(\$core.paneId, \$core.id)
      let data = $props.ema($core.data ,$props.prop_ema_length )
      return \`
      <style>
      .custom-html-legend {
          background-color: $props.ema_color};
          padding: 1px 3px;
          border-radius: 3px;
          color: black;
          font-weight: bold;
    
      }
      </style> 
      <span class="custom-html-legend">
          \${data [ data.map(row => row[0]).indexOf(v[0]) ][1].toFixed(2) }
      </span>
      <label for="ema\${uniqie_id}" >length:</label>
      <input type="number" id="ema\${uniqie_id}" placeholder="\${$props.prop_ema_length}" style="width: 35px; height: 20px; font-size: 12px;">
      
      <label for="colorInput\${uniqie_id}">Select a Color:</label>
      <input type="color" id="colorInput\${uniqie_id}" list="colorOptions" value="\${$props.ema_color}" style="width: 50px; height: 20px; font-size: 12px;">
      
      
      <button id="submitButton\${uniqie_id}">Apply</button>
      <button id="delete\${uniqie_id}">X</button>
  
    
      \`
      
      }
  
  
  
  `
  
    ,
  
  
    // built in RSI 
  
    `
  
  // Navy ~ 0.1-lite
  // ^^^ First comment should provide a NavyJS version
  
  // Meta tag
  [OVERLAY name=RSI, ctx=Canvas, author=ChartMaster, version=1.0.0]
  
  
  const uniqie_id="string"+\`\${$core.paneId}\${$core.id}\`.toString()
  //console.log($core.hub.ovDataSubset(0, 0))
  //console.log($core.hub.mainOv.dataSubset)
  
  
  draw(ctx) {
  
  
  
      document.getElementById("submitButton" + uniqie_id).addEventListener('click', () => {
        const numberInput = document.getElementById("rsi" + uniqie_id);
        rsi_lenght = parseFloat(numberInput.value);
        $props.prop_rsi_length= rsi_lenght  
  
      });
      
      document.getElementById("delete" + uniqie_id).addEventListener('click', () => {
        const customevent = new CustomEvent('legendHtmlUpdate', {
          detail: {
            pid: $core.paneId, 
            oid: $core.id
          }
        });
        document.dispatchEvent(customevent);
  
      });
  
  
      const colorInput = document.getElementById("colorInput" + uniqie_id);
      
      colorInput.addEventListener("input", function() {
        $props.rsi_color = colorInput.value;
      });
  
      ctx.lineWidth = 1
      const layout = $core.layout
      data = $props.rsi($core.data ,$props.prop_rsi_length )//
      const view = $core.view // Visible view
      const radius = $props.radius
      var x, y
      for (var i = view.i1, n = view.i2; i <= n; i++) {    
          ctx.beginPath()
          let p = data[i]
          ctx.strokeStyle = $props.rsi_color
          ctx.moveTo(x, y)
          x = layout.time2x(p[0])
          y = layout.value2y(p[1])
          ctx.lineTo(x, y)
          ctx.stroke()
      }
      
  
      const chartWidth = layout.width; // Width of the chart
  
  
      const y30 = layout.value2y(30);
      const y70 = layout.value2y(70);
  
      ctx.strokeStyle = "red"; // Choose the line color
      ctx.setLineDash([5, 5]); // Set line dash pattern
      ctx.beginPath();
      ctx.moveTo(layout.time2x(data[0][0]), y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.closePath();
  
      ctx.strokeStyle = "green"; // Choose the line color
      ctx.setLineDash([5, 5]); // Set line dash pattern
      ctx.beginPath();
      ctx.moveTo(layout.time2x(data[0][0]), y70);
      ctx.lineTo(chartWidth, y70);
      ctx.stroke();
      ctx.closePath();
  
  
  
  }
  
  
  yRange() => [80, 20]
  
  
  legendHtml(x, prec, f) {
  
    const layout = $core.layout
    let v = \$core.cursor.getValue(\$core.paneId, \$core.id)
    let data = $props.rsi($core.data ,$props.prop_rsi_length )
    return \`
    <style>
    .custom-html-legend {
        background-color: $props.rsi_color};
        padding: 1px 3px;
        border-radius: 3px;
        color: black;
        font-weight: bold;
  
    }
    </style> 
    <span class="custom-html-legend">
        \${data [ data.map(row => row[0]).indexOf(v[0]) ][1].toFixed(2) }
    </span>
  
    <label for="rsi\${uniqie_id}" >length:</label>
    <input type="number" id="rsi\${uniqie_id}" placeholder="\${$props.prop_rsi_length}" style="width: 35px; height: 20px; font-size: 12px;">
  
    <label for="colorInput\${uniqie_id}">Select a Color:</label>
    <input type="color" id="colorInput\${uniqie_id}" list="colorOptions" value="\${$props.rsi_color}" placeholder="\${$props.rsi_color}"  style="width: 50px; height: 20px; font-size: 12px;">
  
  
    <button id="submitButton\${uniqie_id}">Apply</button>
    <button id="delete\${uniqie_id}">X</button>
  
    
    \`
    
    }
  
  `,


//Built in Boolinger Bands

`
// Navy ~ 0.1-lite
// ^^^ First comment should provide a NavyJS version

// Meta tag

[OVERLAY name=BoolingerBands, ctx=Canvas, verion=1.0.0]

draw(ctx) {
  const data = $props.BB($core.data, 30, 2);
  const view = $core.view;
  const layout = $core.layout;
  
  ctx.lineWidth = $props.lineWidth;
  ctx.strokeStyle = $props.color;

  // Draw Background
  ctx.beginPath();
  ctx.fillStyle = $props.backColor;

  for (var i = 0; i < data.length; i++) {
      let p = data[i];
      let x = layout.ti2x(p[0], i);
      let yTop = layout.value2y(p[1] || undefined);
      let yBottom = layout.value2y(p[3] || undefined);

      ctx.lineTo(x, yTop);
      ctx.lineTo(x, yBottom);
  }

  ctx.fill();

  // Draw Top Line
  ctx.beginPath();
  for (var i = 0; i < data.length; i++) {
      let p = data[i];
      let x = layout.ti2x(p[0], i);
      let yTop = layout.value2y(p[1] || undefined);
      ctx.lineTo(x, yTop);
  }
  ctx.stroke();

  // Draw Bottom Line
  ctx.beginPath();
  for (var i = 0; i < data.length; i++) {
      let p = data[i];
      let x = layout.ti2x(p[0], i);
      let yBottom = layout.value2y(p[3] || undefined);
      ctx.lineTo(x, yBottom);
  }
  ctx.stroke();

  // Draw Middle Line
  
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
          let p = data[i];
          let x = layout.ti2x(p[0], i);
          let yMiddle = layout.value2y(p[2] || undefined);
          ctx.lineTo(x, yMiddle);
      
      ctx.stroke();
  }
}
  
yRange(hi, lo) => [
  Math.max(hi, $props.upperBand),
  Math.min(lo, $props.lowerBand)
  ]
legend(x) => $props.showMid ? [
    [x[1], $props.color],
    [x[2], $props.color],
    [x[3], $props.color]
] : [
    [x[1], $props.color],
    [x[3], $props.color]
]
`



  ]


