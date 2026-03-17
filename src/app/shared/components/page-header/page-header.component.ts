import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ title }}</h1>
          <p *ngIf="subtitle" class="subtitle">{{ subtitle }}</p>
        </div>
        <div class="actions">
          <ng-content select="[actions]"></ng-content>
          <button
            *ngIf="showAddButton"
            mat-raised-button
            color="primary"
            (click)="onAdd.emit()">
            <mat-icon>add</mat-icon>
            {{ addButtonText || 'Add New' }}
          </button>
        </div>
      </div>
      <mat-divider></mat-divider>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
    }
    .title-section h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .subtitle {
      margin: 4px 0 0;
      color: rgba(0, 0, 0, 0.6);
    }
    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    mat-icon {
      margin-right: 4px;
    }
    @media (max-width: 600px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() showAddButton = false;
  @Input() addButtonText?: string;
  @Output() onAdd = new EventEmitter<void>();
}
