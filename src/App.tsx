import React, { useEffect, useRef } from 'react';
import {
  SciChartSurface,
  NumericAxis,
  FastLineRenderableSeries,
  XyDataSeries,
  EAxisAlignment,
  EAutoRange,
  NumberRange,
  SciChartJsNavyTheme,
  MouseWheelZoomModifier,
  ZoomPanModifier,
  ZoomExtentsModifier,
  RubberBandXyZoomModifier,
  LegendModifier,
  CursorModifier,
  ELegendOrientation,
  ELegendPlacement,
  parseColorToUIntArgb,
} from 'scichart';

function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const sciChartSurface = useRef<SciChartSurface | null>(null);
  const frameHandle = useRef<any>(null);
  const t = useRef<number>(0);
  const dataSeries = useRef<XyDataSeries[]>([]);

  useEffect(() => {
    const initChart = async () => {
      if (!chartRef.current) return;

      // Set license key (replace with your actual license)
      SciChartSurface.setRuntimeLicenseKey(
        "YOUR_SCICHART_LICENSE_KEY_HERE"
      );

      try {
        // Create the SciChartSurface
        const { sciChartSurface: surface, wasmContext } = await SciChartSurface.create(chartRef.current, {
          theme: new SciChartJsNavyTheme(),
        });

        sciChartSurface.current = surface;

        // Create X and Y axes
        const xAxis = new NumericAxis(wasmContext, {
          axisAlignment: EAxisAlignment.Bottom,
          axisTitle: "Time (s)",
          autoRange: EAutoRange.Always,
          labelProvider: {
            formatLabel: (dataValue: number) => `${(dataValue / 1000).toFixed(1)}`
          }
        });

        const yAxis = new NumericAxis(wasmContext, {
          axisAlignment: EAxisAlignment.Left,
          axisTitle: "Values",
          autoRange: EAutoRange.Always,
        });

        surface.xAxes.add(xAxis);
        surface.yAxes.add(yAxis);

        // Add chart modifiers for interactivity
        surface.chartModifiers.add(
          new MouseWheelZoomModifier(),
          new ZoomPanModifier(),
          new ZoomExtentsModifier(),
          new RubberBandXyZoomModifier(),
          new LegendModifier({
            orientation: ELegendOrientation.Horizontal,
            placement: ELegendPlacement.TopLeft,
            showCheckboxes: true,
            showSeriesMarkers: true,
          }),
          new CursorModifier()
        );

        // Create data series for each signal
        const series1Data = new XyDataSeries(wasmContext, {
          dataSeriesName: "Pressure actual value [bar]",
        });

        const series2Data = new XyDataSeries(wasmContext, {
          dataSeriesName: "Pressure set value [bar]",
        });

        const series3Data = new XyDataSeries(wasmContext, {
          dataSeriesName: "Temperature motor oil [°C]",
        });

        dataSeries.current = [series1Data, series2Data, series3Data];

        // Create renderable series
        const series1 = new FastLineRenderableSeries(wasmContext, {
          dataSeries: series1Data,
          stroke: parseColorToUIntArgb("#1a237e"),
          strokeThickness: 2,
        });

        const series2 = new FastLineRenderableSeries(wasmContext, {
          dataSeries: series2Data,
          stroke: parseColorToUIntArgb("#e53935"),
          strokeThickness: 3,
        });

        const series3 = new FastLineRenderableSeries(wasmContext, {
          dataSeries: series3Data,
          stroke: parseColorToUIntArgb("#03A9F4"),
          strokeThickness: 3,
        });

        surface.renderableSeries.add(series1, series2, series3);

        // Setup data streaming
        const pointsPerSecond = 200000;
        const chunkSize = 1000;
        const interval = 1000 / (pointsPerSecond / chunkSize);

        const pushData = () => {
          const xValues: number[] = [];
          const y1Values: number[] = [];
          const y2Values: number[] = [];
          const y3Values: number[] = [];

          for (let i = 0; i < chunkSize; i++) {
            const x = t.current;
            xValues.push(x);
            y1Values.push(60 + Math.sin(x * 2) * 10);
            y2Values.push(100 + Math.sin(x) * 50);
            y3Values.push(80 + Math.cos(x * 1.5) * 30);
            t.current += 1 / pointsPerSecond;
          }

          // Append data to series
          dataSeries.current[0].appendRange(xValues, y1Values);
          dataSeries.current[1].appendRange(xValues, y2Values);
          dataSeries.current[2].appendRange(xValues, y3Values);

          frameHandle.current = setTimeout(pushData, interval);
        };

        pushData();

      } catch (error) {
        console.error('Error initializing SciChart:', error);
      }
    };

    initChart();

    // Handle window resize
    const handleResize = () => {
      if (sciChartSurface.current) {
        sciChartSurface.current.resizeAndDraw();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameHandle.current) clearTimeout(frameHandle.current);
      window.removeEventListener('resize', handleResize);
      if (sciChartSurface.current) {
        sciChartSurface.current.delete();
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