import { Injectable } from '@angular/core';
import { Signal } from '../models/signal.model';
import {
  SciChartSurface,
  NumericAxis,
  NumericLabelProvider,
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
} from 'scichart';

// ✅ Eigener LabelProvider für Sekundenformat auf X-Achse
class CustomTimeLabelProvider extends NumericLabelProvider {
  override formatLabel(dataValue: number): string {
    return (dataValue / 1000).toFixed(1); // z. B. „1.2“ statt „1200“
  }
}

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

  // ✅ Initialisiert das Chart
  async initChart(container: HTMLDivElement): Promise<SciChartSurface> {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(container, {
      theme: new SciChartJsNavyTheme(),
    });

    this.sciChartSurface = sciChartSurface;

    const xAxis = new NumericAxis(wasmContext, {
      axisAlignment: EAxisAlignment.Bottom,
      axisTitle: "Time (s)",
      autoRange: EAutoRange.Never,
      labelProvider: new CustomTimeLabelProvider()
    });

    const yAxis = new NumericAxis(wasmContext, {
      axisAlignment: EAxisAlignment.Left,
      axisTitle: "Values",
      autoRange: EAutoRange.Never
    });

    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);

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

  // ✅ Setzt neue Signale und fügt Renderables hinzu
  setupSeries(signals: Signal[]): void {
    if (!this.sciChartSurface) return;

    const surface = this.sciChartSurface;
    this.activeSignals = signals;
    this.dataSeries = [];
    this.renderableSeries = [];

    signals.forEach((signal, index) => {
      const dataSeries = new XyDataSeries(surface.webAssemblyContext2D, {
        dataSeriesName: signal.name,
      });

      const renderableSeries = new FastLineRenderableSeries(surface.webAssemblyContext2D, {
        dataSeries,
        stroke: signal.color,
        strokeThickness: 2,
        isVisible: signal.visible,
      });

      this.dataSeries.push(dataSeries);
      this.renderableSeries.push(renderableSeries);
      surface.renderableSeries.add(renderableSeries);

      signal.series = renderableSeries;
    });
  }

  // ✅ Löscht Daten und startet Streaming neu
  clearData(): void {
    if (!this.sciChartSurface) return;

    if (this.frameHandle) {
      window.clearTimeout(this.frameHandle);
    }

    this.dataSeries.forEach(ds => ds.clear());

    this.t = 0;
    this.dataStartTime = 0;
    this.minY = Infinity;
    this.maxY = -Infinity;
    this.isManualControl = false;

    this.resetView();
    this.startStreaming(this.activeSignals, () => {});
  }

  // ✅ Startet das Datenstreaming (z. B. für Simulation)
  startStreaming(signals: Signal[], onUpdate: () => void): void {
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

      signals.forEach((signal, index) => {
        if (this.dataSeries[index] && yValues[index].length > 0) {
          this.dataSeries[index].appendRange(xValues, yValues[index]);
        }
      });

      if (!this.isManualControl) {
        this.resetView();
      }

      this.frameHandle = window.setTimeout(pushData, interval);
    };

    pushData();
  }

  // ✅ Setzt die Ansicht manuell (z. B. via UI-Slider)
  updateView(xZoomLevel: number, yZoomLevel: number, xPosition: number, yPosition: number): void {
    if (!this.sciChartSurface) return;

    this.isManualControl = true;

    const xAxis = this.sciChartSurface.xAxes.get(0);
    const yAxis = this.sciChartSurface.yAxes.get(0);

    const xTotalRange = this.t - this.dataStartTime;
    const yTotalRange = this.maxY - this.minY;

    const xRange = xTotalRange * (100 / xZoomLevel);
    const yRange = yTotalRange * (100 / yZoomLevel);

    const xCenter = this.dataStartTime + xTotalRange * (xPosition / 100);
    const yCenter = this.minY + yTotalRange * (yPosition / 100);

    xAxis.visibleRange = new NumberRange(
      xCenter - xRange / 2,
      xCenter + xRange / 2
    );

    yAxis.visibleRange = new NumberRange(
      yCenter - yRange / 2,
      yCenter + yRange / 2
    );
  }

  // ✅ Setzt Achsenbereiche automatisch basierend auf Y-Min/Max
  resetView(): void {
    if (!this.sciChartSurface) return;

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

  // ✅ Räumt Chart auf
  cleanup(): void {
    if (this.frameHandle) {
      window.clearTimeout(this.frameHandle);
    }
    if (this.sciChartSurface) {
      this.sciChartSurface.delete();
    }
  }
}
