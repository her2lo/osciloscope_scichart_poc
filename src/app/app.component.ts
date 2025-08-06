import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signal } from './models/signal.model';
import { ChartService } from './services/chart.service';
import { SignalControlComponent } from './components/signal-control/signal-control.component';
import { AxisControlComponent } from './components/axis-control/axis-control.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SignalControlComponent,
    AxisControlComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  xZoomLevel = 100;
  yZoomLevel = 100;
  xPosition = 50;
  yPosition = 50;

  signals: Signal[] = [
    { name: 'Pressure actual value [bar]', color: '#1a237e', visible: true },
    { name: 'Pressure set value [bar]', color: '#e53935', visible: true },
    { name: 'Temperature motor oil [°C]', color: '#03A9F4', visible: true }
  ];

  constructor(private chartService: ChartService) {}

  ngOnInit() {
    setTimeout(() => this.initChart(), 0);
  }

  private initChart() {
    if (!this.chartContainer) return;

    const chart = this.chartService.initChart(this.chartContainer.nativeElement);
    this.chartService.setupSeries(this.signals);
    this.chartService.startStreaming(this.signals, () => {
      if (this.xZoomLevel === 100 && this.yZoomLevel === 100) {
        this.resetView();
      }
    });
  }

  toggleSignal(signal: Signal) {
    signal.visible = !signal.visible;
    if (signal.series) {
      signal.series.setVisible(signal.visible);
    }
  }

  resetView() {
    this.xZoomLevel = 100;
    this.yZoomLevel = 100;
    this.xPosition = 50;
    this.yPosition = 50;
    this.chartService.resetView();
  }

  clearData() {
    this.chartService.clearData();
  }

  onXZoomChange(value: number) {
    this.xZoomLevel = value;
    this.updateView();
  }

  onYZoomChange(value: number) {
    this.yZoomLevel = value;
    this.updateView();
  }

  onXPositionChange(value: number) {
    this.xPosition = value;
    this.updateView();
  }

  onYPositionChange(value: number) {
    this.yPosition = value;
    this.updateView();
  }

  private updateView() {
    this.chartService.updateView(
      this.xZoomLevel,
      this.yZoomLevel,
      this.xPosition,
      this.yPosition
    );
  }

  ngOnDestroy() {
    this.chartService.cleanup();
  }
}