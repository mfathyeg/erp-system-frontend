import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="confirm-dialog">
      <div class="dialog-icon" [ngClass]="data.type || 'info'">
        <mat-icon>{{ getIcon() }}</mat-icon>
      </div>

      <h2 class="dialog-title">{{ data.title }}</h2>

      <p class="dialog-message">{{ data.message }}</p>

      <div class="dialog-actions">
        <button class="btn-cancel" [mat-dialog-close]="false">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button
          class="btn-confirm"
          [ngClass]="data.type || 'info'"
          [mat-dialog-close]="true">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 24px;
      text-align: center;
      min-width: 320px;
    }

    .dialog-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .dialog-icon.info {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .dialog-icon.warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .dialog-icon.danger {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .dialog-icon.success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .dialog-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .dialog-title {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .dialog-message {
      margin: 0 0 24px;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-cancel, .btn-confirm {
      padding: 10px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    .btn-cancel:hover {
      background: var(--card-bg-hover);
      border-color: var(--border-light);
    }

    .btn-confirm {
      border: none;
      color: white;
    }

    .btn-confirm.info {
      background: var(--gradient-info);
    }

    .btn-confirm.warning {
      background: var(--gradient-warning);
    }

    .btn-confirm.danger {
      background: var(--gradient-danger);
    }

    .btn-confirm.success {
      background: var(--gradient-success);
    }

    .btn-confirm:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    if (this.data.icon) return this.data.icon;
    switch (this.data.type) {
      case 'warning': return 'warning';
      case 'danger': return 'error';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }
}
