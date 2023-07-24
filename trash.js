wsx.init(["BTC-PERP"]);
wsx.ontrades = (d) => {
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
 