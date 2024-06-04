import { Chart, Nullable, dispose, init } from 'klinecharts';
import React from 'react';

const KlineChart: React.FC = (): JSX.Element => {
  React.useEffect(() => {
    const getBinanceData = async (timestamp: number) => {
      const res = await fetch(
        `https://api.binance.com/api/v3/uiKlines?symbol=BTCUSDT&timeZone=7&interval=15m&limit=1000&endTime=${timestamp}`
      );
      const data = await res.json();
      return data?.map((item: any) => ({
        timestamp: item[0],
        open: Number(item[1]),
        high: Number(item[2]),
        low: Number(item[3]),
        close: Number(item[4]),
        volume: Number(item[5]),
        turnover: Number(item[7]),
      }));
    };

    (async () => {
      try {
        const klineData = await getBinanceData(Date.now());

        const chart = init('k-line-chart') as Chart;

        chart.applyNewData(klineData);

        chart.setStyles('dark');
        chart.createIndicator('EMA', true, { id: 'candle_pane' });
        chart.createIndicator('VOL');
        chart.createIndicator('MACD');

        chart.loadMore((timestamp: Nullable<number>) => {
          setTimeout(async () => {
            const klineData = await getBinanceData(timestamp as number);
            chart.applyMoreData(klineData, true);
          }, 400);
        });

        const websocket = new WebSocket('wss://stream.binance.com:9443/ws');

        websocket.onopen = () => {
          websocket.send(
            JSON.stringify({
              method: 'SUBSCRIBE',
              params: [`btcusdt@kline_15m`],
              id: 1,
            })
          );
        };

        let lastBar: any = null;

        websocket.onmessage = (event) => {
          const message = JSON.parse(event.data);

          if (
            message.e === 'kline' &&
            message.k.i === '15m' &&
            message.k.s === 'BTCUSDT'
          ) {
            const kline = message.k;
            const bar = {
              timestamp: kline.t,
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v),
            };

            if (!lastBar || bar.timestamp > lastBar.timestamp) {
              lastBar = bar;
            } else if (bar.timestamp === lastBar.timestamp) {
              lastBar = bar;
            }
            chart.updateData(lastBar);
          }
        };

        websocket.onerror = (event) => {
          console.error(event);
        };

        websocket.onclose = () => {
          console.log('WebSocket closed');
        };
      } catch (error) {
        console.log(error);
        return null;
      }
    })();

    return () => {
      dispose('chart');
    };
  }, []);

  return <div id="k-line-chart" style={{ height: '100vh' }} />;
};

export default KlineChart;
