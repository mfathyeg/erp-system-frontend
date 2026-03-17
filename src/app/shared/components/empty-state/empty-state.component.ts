import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p *ngIf="message">{{ message }}</p>
      <button
        *ngIf="actionText"
        mat-raised-button
        color="primary"
        (click)="onAction.emit()">
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.2);
      margin-bottom: 16px;
    }
    h3 {
      margin: 0 0 8px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    p {
      margin: 0 0 16px;
      color: rgba(0, 0, 0, 0.6);
      max-width: 300px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data found';
  @Input() message?: string;
  @Input() actionText?: string;
  @Output() onAction = new EventEmitter<void>();
}
