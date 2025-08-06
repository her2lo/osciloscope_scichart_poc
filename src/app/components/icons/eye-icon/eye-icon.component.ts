import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-eye-icon',
  standalone: true,
  template: `
    <svg width="80" height="28" viewBox="0 0 160 56" xmlns="http://www.w3.org/2000/svg" [class]="class">
      <g [attr.fill]="color" [attr.stroke]="color">
        <ellipse 
          cx="35" 
          cy="28" 
          rx="25" 
          ry="15" 
          fill="none" 
          stroke-width="4" 
        />
        <circle 
          cx="35" 
          cy="28" 
          r="6" 
          fill="none" 
          stroke-width="4" 
        />
        <line 
          x1="10" 
          y1="50" 
          x2="60" 
          y2="5" 
          stroke-width="4" 
        />
        <text 
          x="80" 
          y="38" 
          fill="currentColor" 
          font-size="28px" 
          font-family="sans-serif" 
          font-weight="bold"
        >HIDE</text>
      </g>
    </svg>
  `,
  styles: [`
    svg {
      cursor: pointer;
      transition: opacity 0.2s ease-in-out;
    }
    
    svg:hover {
      opacity: 0.8;
    }
  `]
})
export class EyeIconComponent {
  @Input() color = '#4B6575';
  @Input() class = '';
}