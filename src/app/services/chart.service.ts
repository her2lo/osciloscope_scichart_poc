import { Injectable } from '@angular/core';
import { Signal } from '../models/signal.model';
import {
  lightningChart,
  AxisTickStrategies,
  Themes,
  ChartXY,
  Dashboard,
  SolidFill,
  ColorHEX,
  LineSeries,
} from '@arction/lcjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private chart?: ChartXY;
  private dashboard?: Dashboard;
  private frameHandle?: number;
  private t = 0;
  private dataStartTime = 0;
  private minY = Infinity;
  private maxY = -Infinity;
  private isManualControl = false;
  private series: LineSeries[] = [];
  private activeSignals: Signal[] = [];

  initChart(container: HTMLDivElement) {
    const lc = lightningChart({
      license: '0002-n0gRRhsqA7RCjiZjMcbIwm4oK9HNKwBJEX8PMwa7VpcjbOl+EMeHvAOkp3oe5wUnLWLJNONsll1wx5ZKVGzziCdj-MEUCIQDuqELKD0F3Vh5dfDl/5JhcU44NtcvKTaoYAHTTImx7NgIgUZc+nLicIkkJG6y+IfGRtUgJqL49MEFqHfSJfhbb7uk=',
      licenseInformation: {
        appTitle: 'LightningChart JS Trial',
        company: 'LightningChart Ltd.',
      },
    });

    this.dashboard = lc.Dashboard({
      container,
      theme: Themes.light,
      numberOfRows: 1,
      numberOfColumns: 1,
    });

    this.chart = this.dashboard.createChartXY({ columnIndex: 0, rowIndex: 0 });
    this.chart.setTitle('');
    this.chart.setPadding({ right: 50 });

    const axisX = this.chart.getDefaultAxisX()
      .setTitle('Time (s)')
      .setTickStrategy(AxisTickStrategies.Numeric, ts =>
        ts.setFormattingFunction(v => `${(v / 1000).toFixed(1)}`)
      );

    const axisY = this.chart.getDefaultAxisY()
      .setTitle('Values')
      .setTickStrategy(AxisTickStrategies.Numeric);

    this.dataStartTime = this.t;
    return this.chart;
  }

  setupSeries(signals: Signal[]) {
    if (!this.chart) return;

    this.activeSignals = signals;
    this.series = signals.map(signal => {
      const series = this.chart!.addLineSeries()
        .setName(signal.name)
        .setStrokeStyle(style =>
          style.setThickness(2)
            .setFillStyle(new SolidFill({ color: ColorHEX(signal.color) }))
        );
      signal.series = series;
      return series;
    });
  }

  clearData() {
    if (!this.chart) return;
    
    // Stop current streaming
    if (this.frameHandle) {
      window.clearTimeout(this.frameHandle);
    }

    // Clear all series data
    this.series.forEach(series => {
      series.clear();
    });

    // Reset time and data tracking
    this.t = 0;
    this.dataStartTime = 0;
    this.minY = Infinity;
    this.maxY = -Infinity;
    this.isManualControl = false;

    // Reset axes
    this.resetView();

    // Restart streaming with active signals
    this.startStreaming(this.activeSignals, () => {});
  }

  startStreaming(signals: Signal[], onUpdate: () => void) {
    if (!this.chart || signals.length === 0) return;

    const pointsPerSecond = 200;
    const chunkSize = 10;
    const interval = 10 / (pointsPerSecond / chunkSize);

    const pushData = () => {
      if (!signals.every(s => s.series)) return;

      const data: { x: number, y: number }[][] = signals.map(() => []);

      for (let i = 0; i < chunkSize; i++) {
        const x = this.t;
        const y1 = 60 + Math.sin(x * 2) * 10;
        const y2 = 100 + Math.sin(x) * 50;
        const y3 = 80 + Math.cos(x * 1.5) * 30;

        this.minY = Math.min(this.minY, y1, y2, y3);
        this.maxY = Math.max(this.maxY, y1, y2, y3);

        if (signals[0]) data[0].push({ x, y: y1 });
        if (signals[1]) data[1].push({ x, y: y2 });
        if (signals[2]) data[2].push({ x, y: y3 });
        
        this.t += 1 / pointsPerSecond;
      }

      signals.forEach((signal, index) => {
        if (signal.series && data[index]) {
          signal.series.add(data[index]);
        }
      });

      // Only auto-fit if not in manual control mode
      if (!this.isManualControl) {
        this.resetView();
      }

      this.frameHandle = window.setTimeout(pushData, interval);
    };

    pushData();
  }

  updateView(xZoomLevel: number, yZoomLevel: number, xPosition: number, yPosition: number) {
    if (!this.chart) return;

    // Set manual control mode when sliders are used
    this.isManualControl = true;

    const xAxis = this.chart.getDefaultAxisX();
    const yAxis = this.chart.getDefaultAxisY();

    const xTotalRange = this.t - this.dataStartTime;
    const yTotalRange = this.maxY - this.minY;

    const xRange = xTotalRange * (100 / xZoomLevel);
    const yRange = yTotalRange * (100 / yZoomLevel);

    // Calculate center points based on position
    const xCenter = this.dataStartTime + (xTotalRange * (xPosition / 100));
    const yCenter = this.minY + (yTotalRange * (yPosition / 100));

    xAxis.setInterval({
      start: xCenter - xRange / 2,
      end: xCenter + xRange / 2
    });

    yAxis.setInterval({
      start: yCenter - yRange / 2,
      end: yCenter + yRange / 2
    });
  }

  resetView() {
    if (!this.chart) return;

    // Reset manual control mode
    this.isManualControl = false;

    const xAxis = this.chart.getDefaultAxisX();
    const yAxis = this.chart.getDefaultAxisY();
    
    xAxis.setInterval({ start: this.dataStartTime, end: this.t });
    
    const yPadding = (this.maxY - this.minY) * 0.1;
    yAxis.setInterval({ 
      start: this.minY - yPadding, 
      end: this.maxY + yPadding 
    });
  }

  cleanup() {
    if (this.frameHandle) {
      window.clearTimeout(this.frameHandle);
    }
    if (this.dashboard) {
      this.dashboard.dispose();
    }
  }
}