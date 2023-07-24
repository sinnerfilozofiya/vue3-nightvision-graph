// Make new candles from trade stream
export default function sample(ohlcv, trade, tf = 60000) {
  let last = ohlcv[ohlcv.length - 1];
  if (!last) return;

  let tick = trade["price"];
  let volume = trade["volume"] || 0;
  let tNext = last[0] + tf;
  let tn = new Date().getTime();

  if (tn >= tNext && tick !== undefined) {
    // Create a new candle
    let t = tn - (tn % tf);
    let nc = [t, tick, tick, tick, tick, volume];
    ohlcv.push(nc);
    return true; // Make update('range')
  } else if (tick !== undefined) {
    // Update an existing candle
    last[2] = Math.max(tick, last[2]);
    last[3] = Math.min(tick, last[3]);
    last[4] = tick;
    last[5] += volume;
    return false; // Make regular('update')
  }

  return false; // No update needed when tick is undefined
}
