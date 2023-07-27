class DataLoader {
  constructor(TF) {
    this.URL = "https://api1.binance.com/api/v3/klines";
    this.SYM = "BTCUSDT";
    this.TF = TF; // See binance api definitions

    this.loading = false;
  }
  updateInterval(newInterval) {
    this.TF = newInterval;
  }
  async load(callback) {
    let url = `${this.URL}?symbol=${this.SYM}&interval=${this.TF}`;
    let result = await fetch(url);
    let data = await result.json();
    callback({
      panes: [
        {
          overlays: [
            {
              name: "BTC Tether US Binance",
              type: "Candles",
              data: data.map((x) => this.format(x))
            }
          ]
        }
      ]
    });
  }

  async loadMore(endTime, callback) {
    if (this.loading) return;
    this.loading = true;
    let url = `${this.URL}?symbol=${this.SYM}&interval=${this.TF}`;
    url += `&endTime=${endTime}`;
    let result = await fetch(url);
    let data = await result.json();
    callback(data.map((x) => this.format(x)));
    this.loading = false;
  }

  format(x) {
    return [
      x[0],
      parseFloat(x[1]),
      parseFloat(x[2]),
      parseFloat(x[3]),
      parseFloat(x[4]),
      parseFloat(x[5])
    ];
  }
}

export { DataLoader };
