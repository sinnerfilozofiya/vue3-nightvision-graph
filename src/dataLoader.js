import { RSI , BollingerBands , EMA  } from '@debut/indicators';


function rsi_indicator(inputList) {

  const modifiedList_rsi = [];
  const Period = 30;
  const rsii = new RSI(Period);
  for (let i = 0; i < inputList.length; i++) {
    const rsi_val = rsii.nextValue(inputList[i][4]);
    modifiedList_rsi.push([inputList[i][0],rsi_val])
  }
  return modifiedList_rsi;
}

function bb_indicator(inputList) {

  const modifiedList_bb = [];
  const Period = 30;
  const std = 2;
  const bb_now = new BollingerBands(Period,std);
  for (let i = 0; i < inputList.length; i++) {
    const bb_set = bb_now.nextValue(inputList[i][4]);
    if (bb_set){
      modifiedList_bb.push([ inputList[i][0] , bb_set.upper , bb_set.middle , bb_set.lower ])
    }
  }
  return modifiedList_bb;
}

function ema_indicator(inputList) {

  const modifiedList_ema = [];
  const Period = 200;
  const ema = new EMA(Period);
  for (let i = 0; i < inputList.length; i++) {
    const ema_val = ema.nextValue(inputList[i][4]);
    modifiedList_ema.push([inputList[i][0],ema_val])
  }
  return modifiedList_ema;
}

class DataLoader {
    constructor(pair,timeframe) {
      this.URL = "https://api1.binance.com/api/v3/klines";
      this.SYM = pair;
      this.TF = timeframe; // See binance api definitions
      this.loading = false;
    }
    updateInterval(newtimeframe) {
      this.TF = newtimeframe;
    }
    updatepair(newpair) {
      this.SYM = newpair;
    }
    async load(callback) {
      let url = `${this.URL}?symbol=${this.SYM}&interval=${this.TF}`;
      let result = await fetch(url);
      let data = await result.json();
      console.log(data)
      callback({
        panes: [
          
          {
            overlays: [
              {
                name: this.SYM,
                type: "Candles",
                data: data.map((x) => this.format(x)),
              },
              {
                name: "gigachad charts",
                type: "Custom",
                data: data.map((x) => this.format(x)),
                settings: {},
                props: {
                  special_text : 'indicator',
                  teset_function :function (asd) {
                    console.log(asd)
                  },
                }
              },
              {
                name: "BollingerBands",
                type: "Band",
                data: bb_indicator( data.map((x) => this.format(x))),
              },
              {
                name: "EMA",
                type: "Spline",
                data: ema_indicator( data.map((x) => this.format(x))),
              },
              {
                type: "MeasureTool",
                props:{
                  clear:false,
                  state_manager:false,
                }
              },
              {
                type: "TrendLineTool",
                props:{
                  state_manager:false,
                  clear:false,
                }
              },
              {

                name: "BUILT IN EMA ",
                type: "EMA",
                data: data.map((x) => this.format(x)),
                props:{
                  prop_ema_length : 20  ,


                  ema:function (inputList , ema_length=20) {
                    const modifiedList_ema = [];
                    const Period = ema_length;
                    const ema = new EMA(Period);
                    for (let i = 0; i < inputList.length; i++) {
                      const ema_val = ema.nextValue(inputList[i][4]);
                      modifiedList_ema.push([inputList[i][0],ema_val])
                    }
                    return modifiedList_ema;
                  }
                  ,
                 
                }
              },
            ]
          },
          {
            overlays: [
              {
                name: "RSI",
                type: "Splines",
                data:rsi_indicator( data.map((x) => this.format(x))),
              },
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
  
  export { DataLoader , rsi_indicator , bb_indicator , ema_indicator};
  