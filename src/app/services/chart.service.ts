import { Injectable } from '@angular/core';
import { Signal } from '../models/signal.model';
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

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private sciChartSurface?: SciChartSurface;
  private frameHandle?: number;
  private t = 0;
  private dataStartTime = 0;
  private minY = Infinity;
  private maxY = -Infinity;
  private isManualControl = false;
  private dataSeries: XyDataSeries[] = [];
  private renderableSeries: FastLineRenderableSeries[] = [];
  private activeSignals: Signal[] = [];

  async initChart(container: HTMLDivElement) {
    // Initialize SciChart with license (trial license)
    SciChartSurface.setRuntimeLicenseKey(
      "YOUR_SCICHART_LICENSE_KEY_HERE" // Replace with actual license key
    );

    // Create the SciChartSurface
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(container, {
      theme: new SciChartJsNavyTheme(),
    });

    this.sciChartSurface = sciChartSurface;

    // Create X and Y axes
    const xAxis = new NumericAxis(wasmContext, {
      axisAlignment: EAxisAlignment.Bottom,
      axisTitle: "Time (s)",
      autoRange: EAutoRange.Never,
      labelProvider: {
        formatLabel: (dataValue: number) => `${(dataValue / 1000).toFixed(1)}`
      }
    });

    const yAxis = new NumericAxis(wasmContext, {
      axisAlignment: EAxisAlignment.Left,
      axisTitle: "Values",
      autoRange: EAutoRange.Never,
    });

    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);

    // Add chart modifiers for interactivity
    sciChartSurface.chartModifiers.add(
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

    this.dataStartTime = this.t;
    return sciChartSurface;
  }

  setupSeries(signals: Signal[]) {
    if (!this.sciChartSurface) return;

    this.activeSignals = signals;
    this.dataSeries = [];
    this.renderableSeries = [];

    signals.forEach((signal, index) => {
      // Create data series
      const dataSeries = new XyDataSeries(this.sciChartSurface!.webAssemblyContext2D, {
        dataSeriesName: signal.name,
      });

      // Create renderable series
      const renderableSeries = new FastLineRenderableSeries(this.sciChartSurface!.webAssemblyContext2D, {
        dataSeries,
        stroke: parseColorToUIntArgb(signal.color),
        strokeThickness: 2,
        isVisible: signal.visible,
      });

      this.dataSeries.push(dataSeries);
      this.renderableSeries.push(renderableSeries);
      this.sciChartSurface.renderableSeries.add(renderableSeries);

      // Store reference in signal for visibility control
      signal.series = renderableSeries;
    });
  }

  clearData() {
    if (!this.sciChartSurface) return;
    
    // Stop current streaming
    if (this.frameHandle) {
      window.clearTimeout(this.frameHandle);
    }

    // Clear all data series
    this.dataSeries.forEach(dataSeries => {
      dataSeries.clear();
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
    if (!this.sciChartSurface || signals.length === 0) return;

    const pointsPerSecond = 200;
    const chunkSize = 10;
    const interval = 10 / (pointsPerSecond / chunkSize);

    const pushData = () => {
      if (!this.dataSeries.length) return;

      const xValues: number[] = [];
      const yValues: number[][] = [[], [], []];

      for (let i = 0; i < chunkSize; i++) {
        const x = this.t;
        const y1 = 60 + Math.sin(x * 2) * 10;
        const y2 = 100 + Math.sin(x) * 50;
        const y3 = 80 + Math.cos(x * 1.5) * 30;

        this.minY = Math.min(this.minY, y1, y2, y3);
        this.maxY = Math.max(this.maxY, y1, y2, y3);

        xValues.push(x);
        if (signals[0]) yValues[0].push(y1);
        if (signals[1]) yValues[1].push(y2);
        if (signals[2]) yValues[2].push(y3);
        
        this.t += 1 / pointsPerSecond;
      }

      // Append data to series
      signals.forEach((signal, index) => {
        if (this.dataSeries[index] && yValues[index].length > 0) {
          this.dataSeries[index].appendRange(xValues, yValues[index]);
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
    if (!this.sciChartSurface) return;

    // Set manual control mode when sliders are used
    this.isManualControl = true;

    const xAxis = this.sciChartSurface.xAxes.get(0);
    const yAxis = this.sciChartSurface.yAxes.get(0);

    const xTotalRange = this.t - this.dataStartTime;
    const yTotalRange = this.maxY - this.minY;

    const xRange = xTotalRange * (100 / xZoomLevel);
    const yRange = yTotalRange * (100 / yZoomLevel);

    // Calculate center points based on position
    const xCenter = this.dataStartTime + (xTotalRange * (xPosition / 100));
    const yCenter = this.minY + (yTotalRange * (yPosition / 100));

    xAxis.visibleRange = new NumberRange(
      xCenter - xRange / 2,
      xCenter + xRange / 2
    );

    yAxis.visibleRange = new NumberRange(
      yCenter - yRange / 2,
      yCenter + yRange / 2
    );
  }

  resetView() {
    if (!this.sciChartSurface) return;

    // Reset manual control mode
    this.isManualControl = false;

    const xAxis = this.sciChartSurface.xAxes.get(0);
    const yAxis = this.sciChartSurface.yAxes.get(0);
    
    xAxis.visibleRange = new NumberRange(this.dataStartTime, this.t);
    
    const yPadding = (this.maxY - this.minY) * 0.1;
    yAxis.visibleRange = new NumberRange(
      this.minY - yPadding, 
      this.maxY + yPadding
    );
  }

  cleanup() {
    if (this.frameHandle) {
      window.clearTimeout(this.frameHandle);
    }
    if (this.sciChartSurface) {
      this.sciChartSurface.delete();
    }
  }
}