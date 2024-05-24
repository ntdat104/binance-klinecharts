import { Chart, dispose, init } from 'klinecharts';
import React from 'react';

const KlineChart: React.FC = (): JSX.Element => {
  React.useEffect(() => {
    const genData = (timestamp = new Date().getTime(), length = 800) => {
      let basePrice = 5000;
      timestamp =
        Math.floor(timestamp / 1000 / 60) * 60 * 1000 - length * 60 * 1000;
      const dataList = [];
      for (let i = 0; i < length; i++) {
        const prices = [];
        for (let j = 0; j < 4; j++) {
          prices.push(basePrice + Math.random() * 60 - 30);
        }
        prices.sort();
        const open = +prices[Math.round(Math.random() * 3)].toFixed(2);
        const high = +prices[3].toFixed(2);
        const low = +prices[0].toFixed(2);
        const close = +prices[Math.round(Math.random() * 3)].toFixed(2);
        const volume = Math.round(Math.random() * 100) + 10;
        const turnover = ((open + high + low + close) / 4) * volume;
        dataList.push({ timestamp, open, high, low, close, volume, turnover });

        basePrice = close;
        timestamp += 60 * 1000;
      }
      return dataList;
    };

    const chart = init('k-line-chart') as Chart;

    chart.applyNewData(genData());
    chart.setStyles('dark');
    chart.createIndicator('EMA', true, { id: 'candle_pane' });
    chart.createIndicator('VOL');
    chart.createIndicator('MACD');

    chart.loadMore((timestamp: any) => {
      setTimeout(() => {
        chart.applyMoreData(genData(timestamp), true);
      }, 2000);
    });

    chart.applyNewData(genData(), true);
    updateData();

    function updateData() {
      setTimeout(() => {
        const dataList = chart.getDataList();
        const lastData = dataList[dataList.length - 1];
        const newData: any = { ...lastData };
        newData.close += Math.random() * 20 - 10;
        newData.high = Math.max(newData.high, newData.close);
        newData.low = Math.min(newData.low, newData.close);
        newData.volume += Math.round(Math.random());
        chart.updateData(newData);
        updateData();
      }, 100);
    }

    return () => {
      dispose('chart');
    };
  }, []);

  return <div id="k-line-chart" style={{ height: '100vh' }} />;
};

export default KlineChart;
