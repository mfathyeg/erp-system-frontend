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
        <mat-form-field *ngIf="showSearch" appearance="outline" class="search-field">
          <mat-label>Search</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search..." #searchInput>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
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
              <button mat-icon-button *ngIf="showView" (click)="onView.emit(row)" matTooltip="View">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button *ngIf="showEdit" (click)="onEdit.emit(row)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button *ngIf="showDelete" (click)="onDelete.emit(row)" matTooltip="Delete" color="warn">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.clickable]="rowClickable"
              (click)="rowClickable && onRowClick.emit(row)"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              {{ noDataMessage }}
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
      background: white;
      border-radius: 4px;
      overflow: hidden;
    }
    .table-toolbar {
      padding: 16px;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-field {
      min-width: 250px;
    }
    .table-wrapper {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-completed, .status-delivered, .status-paid { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled, .status-error { background: #ffebee; color: #c62828; }
    .status-processing, .status-shipped { background: #e3f2fd; color: #1565c0; }
    .no-data {
      text-align: center;
      padding: 48px;
      color: rgba(0, 0, 0, 0.6);
    }
    .clickable {
      cursor: pointer;
    }
    .clickable:hover {
      background: rgba(0, 0, 0, 0.04);
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
