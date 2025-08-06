import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signal } from '../../models/signal.model';
import { EyeIconComponent } from '../icons/eye-icon/eye-icon.component';

@Component({
  selector: 'app-signal-control',
  standalone: true,
  imports: [CommonModule, EyeIconComponent],
  templateUrl: './signal-control.component.html',
  styleUrls: ['./signal-control.component.css']
})
export class SignalControlComponent {
  @Input() signals: Signal[] = [];
  @Output() toggleSignal = new EventEmitter<Signal>();

  onToggle(signal: Signal) {
    this.toggleSignal.emit(signal);
  }
}