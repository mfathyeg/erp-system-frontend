import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <div class="empty-icon" [ngClass]="color">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3>{{ title }}</h3>
      <p *ngIf="message">{{ message }}</p>
      <button
        *ngIf="actionText"
        class="btn-action"
        (click)="onAction.emit()">
        <mat-icon *ngIf="actionIcon">{{ actionIcon }}</mat-icon>
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
      padding: 64px 24px;
      text-align: center;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    .empty-icon.primary {
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary-color);
    }

    .empty-icon.info {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .empty-icon.success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .empty-icon.warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .empty-icon.danger {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .empty-icon.muted {
      background: var(--secondary-bg);
      color: var(--text-muted);
    }

    .empty-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0 0 24px;
      color: var(--text-secondary);
      font-size: 14px;
      max-width: 320px;
      line-height: 1.6;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--gradient-primary);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .btn-action mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data found';
  @Input() message?: string;
  @Input() actionText?: string;
  @Input() actionIcon?: string;
  @Input() color: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'muted' = 'muted';
  @Output() onAction = new EventEmitter<void>();
}
