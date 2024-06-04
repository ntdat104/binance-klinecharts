import { Chart, LoadDataParams, dispose, init } from 'klinecharts';
import React from 'react';

const KlineChart: React.FC = (): JSX.Element => {
  React.useEffect(() => {
    function updateData(chart: Chart) {
      setTimeout(() => {
        const dataList = chart.getDataList();
        const lastData = dataList[dataList.length - 1];
        const newData: any = { ...lastData };
        newData.close += Math.random() * 20 - 10;
        newData.high = Math.max(newData.high, newData.close);
        newData.low = Math.min(newData.low, newData.close);
        newData.volume += Math.round(Math.random());
        chart.updateData(newData);
        updateData(chart);
      }, 100);
    }

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

        chart.setLoadDataCallback((params: LoadDataParams) => {
          setTimeout(async () => {
            const { data } = params;
            const klineData = await getBinanceData(data?.timestamp as number);
            chart.applyMoreData(klineData, true);
          }, 1000);
        });

        updateData(chart);
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
