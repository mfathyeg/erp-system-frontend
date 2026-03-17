import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-overlay" *ngIf="show">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    p {
      margin-top: 16px;
      color: #666;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() show = false;
  @Input() diameter = 50;
  @Input() message?: string;
}
