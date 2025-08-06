import React, { useEffect, useRef } from 'react';
import {
  lightningChart,
  AxisTickStrategies,
  UIElementBuilders,
  UILayoutBuilders,
  Themes,
  AutoCursorModes,
} from '@arction/lcjs';

function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const frameHandle = useRef<any>(null);
  const t = useRef<number>(0);

  useEffect(() => {
    if (!chartRef.current) return;

    // Create chart factory instance
    const lc = lightningChart({
      license:
        '0002-n0gRRhsqA7RCjiZjMcbIwm4oK9HNKwBJEX8PMwa7VpcjbOl+EMeHvAOkp3oe5wUnLWLJNONsll1wx5ZKVGzziCdj-MEUCIQDuqELKD0F3Vh5dfDl/5JhcU44NtcvKTaoYAHTTImx7NgIgUZc+nLicIkkJG6y+IfGRtUgJqL49MEFqHfSJfhbb7uk=',
      licenseInformation: {
        appTitle: 'LightningChart JS Trial',
        company: 'LightningChart Ltd.',
      },
    });

    // Create chart
    const chart = lc
      .ChartXY({
        container: chartRef.current,
        theme: Themes.lightNew,
      })
      .setTitle('')
      .setPadding({ right: 50 })
      .setZoomingMode('xy'); // Use string literal instead of enum

    chartInstance.current = chart;

    const axisX = chart
      .getDefaultAxisX()
      .setScrollStrategy(undefined)
      .setTitle('X axis spacing')
      .setTickStrategy(AxisTickStrategies.Numeric, (tickStrategy) =>
        tickStrategy.setTitleFormatter((v) => `${(v / 1000).toFixed(1)} s`)
      );

    const axisY = chart
      .getDefaultAxisY()
      .setTitle('Y axis spacing')
      .setTickStrategy(AxisTickStrategies.Numeric);

    const series1 = chart
      .addLineSeries()
      .setName('Pressure actual value [bar]')
      .setStrokeStyle((s) => s.setPattern(2, 2).setThickness(2));

    const series2 = chart
      .addLineSeries()
      .setName('Pressure set value [bar]')
      .setStrokeStyle((s) => s.setThickness(3).setColor('#e53935'));

    const series3 = chart
      .addLineSeries()
      .setName('Temperature motor oil [°C]')
      .setStrokeStyle((s) => s.setThickness(3).setColor('#03A9F4'));

    // Add legend
    chart
      .addUIElement(UIElementBuilders.LegendBox)
      .setPosition({ x: 0, y: 0 })
      .setOrigin({ x: 0, y: 0 })
      .add(chart);

    // Add control buttons
    const layout = chart
      .addUIElement(UILayoutBuilders.Row)
      .setPosition({ x: 50, y: 100 })
      .setOrigin({ x: 0, y: 0 });

    layout
      .addElement(UIElementBuilders.TextBox)
      .setText('X axis spacing')
      .setMargin(5);

    layout
      .addElement(UIElementBuilders.Button)
      .setText('SMALLER')
      .onMouseClick(() => {
        const interval = axisX.getInterval();
        const center = (interval.start + interval.end) / 2;
        const range = (interval.end - interval.start) * 0.5;
        axisX.setInterval(center - range / 2, center + range / 2);
      });

    layout
      .addElement(UIElementBuilders.Button)
      .setText('BIGGER')
      .onMouseClick(() => {
        const interval = axisX.getInterval();
        const center = (interval.start + interval.end) / 2;
        const range = (interval.end - interval.start) * 2;
        axisX.setInterval(center - range / 2, center + range / 2);
      });

    // Add crosshair cursor
    const cursor = chart.setCursorResultTableBuilder(
      UIElementBuilders.CursorResultTable
    );
    chart.setAutoCursor(AutoCursorModes.onHover);

    // Setup data streaming
    const pointsPerSecond = 200000;
    const chunkSize = 1000;
    const interval = 1000 / (pointsPerSecond / chunkSize);

    const pushData = () => {
      const data1 = [];
      const data2 = [];
      const data3 = [];

      for (let i = 0; i < chunkSize; i++) {
        const x = t.current;
        data1.push({ x, y: 60 + Math.sin(x * 2) * 10 });
        data2.push({ x, y: 100 + Math.sin(x) * 50 });
        data3.push({ x, y: 80 + Math.cos(x * 1.5) * 30 });
        t.current += 1 / pointsPerSecond;
      }

      series1.add(data1);
      series2.add(data2);
      series3.add(data3);

      frameHandle.current = setTimeout(pushData, interval);
    };

    pushData();

    // Handle window resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.engine.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameHandle.current) clearTimeout(frameHandle.current);
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
}

export default App;
