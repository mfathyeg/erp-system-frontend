import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="breadcrumb" *ngIf="breadcrumb">
            <span class="breadcrumb-item" *ngFor="let item of breadcrumb; let last = last">
              {{ item }}
              <mat-icon *ngIf="!last">chevron_right</mat-icon>
            </span>
          </div>
          <h1>{{ title }}</h1>
          <p *ngIf="subtitle" class="subtitle">{{ subtitle }}</p>
        </div>
        <div class="actions">
          <ng-content select="[actions]"></ng-content>
          <button
            *ngIf="showAddButton"
            class="btn-add"
            (click)="onAdd.emit()">
            <mat-icon>add</mat-icon>
            {{ addButtonText || 'Add New' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .title-section h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .breadcrumb-item:last-child {
      color: var(--primary-light);
    }

    .breadcrumb-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .subtitle {
      margin: 8px 0 0;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-add {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--gradient-primary);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-add:hover {
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
    }

    .btn-add mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 600px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .title-section h1 {
        font-size: 24px;
      }

      .actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumb?: string[];
  @Input() showAddButton = false;
  @Input() addButtonText?: string;
  @Output() onAdd = new EventEmitter<void>();
}
