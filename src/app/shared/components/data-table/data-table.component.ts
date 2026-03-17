import { Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'currency' | 'status' | 'actions';
  format?: string;
}

@Component({
  selector: 'app-data-table',
  template: `
    <div class="table-container">
      <div class="table-toolbar" *ngIf="showSearch || showFilter">
        <div class="search-box" *ngIf="showSearch">
          <mat-icon>search</mat-icon>
          <input
            type="text"
            (keyup)="applyFilter($event)"
            placeholder="Search..."
            #searchInput>
        </div>
        <ng-content select="[filters]"></ng-content>
      </div>

      <div class="table-wrapper">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)">
          <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
            <th mat-header-cell *matHeaderCellDef
                [mat-sort-header]="column.sortable !== false ? column.key : ''">
              {{ column.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              <ng-container [ngSwitch]="column.type">
                <ng-container *ngSwitchCase="'date'">
                  {{ row[column.key] | date: (column.format || 'medium') }}
                </ng-container>
                <ng-container *ngSwitchCase="'currency'">
                  {{ row[column.key] | currencyFormat }}
                </ng-container>
                <ng-container *ngSwitchCase="'status'">
                  <span class="status-badge" [ngClass]="getStatusClass(row[column.key])">
                    {{ row[column.key] }}
                  </span>
                </ng-container>
                <ng-container *ngSwitchCase="'actions'">
                  <ng-content select="[row-actions]"></ng-content>
                </ng-container>
                <ng-container *ngSwitchDefault>
                  {{ row[column.key] }}
                </ng-container>
              </ng-container>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions" *ngIf="showActions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <div class="action-buttons">
                <button class="action-btn view" *ngIf="showView" (click)="onView.emit(row)" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button class="action-btn edit" *ngIf="showEdit" (click)="onEdit.emit(row)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button class="action-btn delete" *ngIf="showDelete" (click)="onDelete.emit(row)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.clickable]="rowClickable"
              (click)="rowClickable && onRowClick.emit(row)"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              <div class="empty-table">
                <mat-icon>inbox</mat-icon>
                <span>{{ noDataMessage }}</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <mat-paginator
        *ngIf="showPagination"
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        [pageIndex]="pageIndex"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }

    .table-toolbar {
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--border-color);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px 16px;
      min-width: 280px;
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .search-box mat-icon {
      color: var(--text-muted);
      font-size: 20px;
    }

    .search-box input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 14px;
    }

    .search-box input::placeholder {
      color: var(--text-muted);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .status-badge {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .status-completed, .status-delivered, .status-paid, .status-active {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .status-cancelled, .status-error, .status-inactive {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .status-processing, .status-shipped {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--card-bg-hover);
    }

    .action-btn.view:hover {
      color: var(--info-color);
    }

    .action-btn.edit:hover {
      color: var(--primary-color);
    }

    .action-btn.delete:hover {
      color: var(--danger-color);
    }

    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .empty-table {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: var(--text-muted);
    }

    .empty-table mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .no-data {
      text-align: center;
    }

    .clickable {
      cursor: pointer;
    }

    .clickable:hover {
      background: var(--card-bg-hover) !important;
    }

    @media (max-width: 768px) {
      .search-box {
        min-width: 100%;
      }
    }
  `]
})
export class DataTableComponent<T> implements OnInit, AfterViewInit {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() showActions = false;
  @Input() showView = false;
  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() showSearch = true;
  @Input() showFilter = false;
  @Input() showPagination = true;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions = [5, 10, 25, 50];
  @Input() noDataMessage = 'No data available';
  @Input() rowClickable = false;

  @Output() onView = new EventEmitter<T>();
  @Output() onEdit = new EventEmitter<T>();
  @Output() onDelete = new EventEmitter<T>();
  @Output() onRowClick = new EventEmitter<T>();
  @Output() onSort = new EventEmitter<Sort>();
  @Output() onPage = new EventEmitter<PageEvent>();
  @Output() onSearch = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<T>();
  displayedColumns: string[] = [];

  ngOnInit(): void {
    this.displayedColumns = this.columns.map(c => c.key);
    if (this.showActions) {
      this.displayedColumns.push('actions');
    }
    this.dataSource.data = this.data;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    this.dataSource.data = this.data;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.onSearch.emit(filterValue);
  }

  onSortChange(sort: Sort): void {
    this.onSort.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.onPage.emit(event);
  }

  getStatusClass(status: string): string {
    return `status-${status?.toLowerCase().replace(/\s/g, '-')}`;
  }
}
