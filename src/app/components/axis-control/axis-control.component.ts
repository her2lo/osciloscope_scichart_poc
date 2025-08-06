import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-axis-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './axis-control.component.html',
  styleUrls: ['./axis-control.component.css']
})
export class AxisControlComponent {
  @Input() title = '';
  @Input() value = 50;
  @Input() min = 0;
  @Input() max = 100;
  @Input() unit = '%';
  @Input() containerClass = '';
  @Input() vertical = false;
  @Output() valueChange = new EventEmitter<number>();

  verticalStyle = {
    transform: 'rotate(-90deg)',
    transformOrigin: 'center'
  };

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.valueChange.emit(Number(input.value));
    }
  }

  onValueChange(value: number) {
    this.valueChange.emit(value);
  }
}