import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InventoryItem, PaginationParams } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InventoryFormComponent } from '../inventory-form/inventory-form.component';

@Component({
  selector: 'app-inventory-list',
  template: `
    <div class="inventory-container">
      <app-page-header
        title="Inventory Management"
        subtitle="Manage your inventory items"
        [showAddButton]="true"
        addButtonText="Add Item"
        (onAdd)="openItemForm()">
      </app-page-header>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="onSearch($event)" placeholder="Search items...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select (selectionChange)="onCategoryFilter($event.value)">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Stock Status</mat-label>
              <mat-select (selectionChange)="onStockFilter($event.value)">
                <mat-option value="">All</mat-option>
                <mat-option value="in-stock">In Stock</mat-option>
                <mat-option value="low-stock">Low Stock</mat-option>
                <mat-option value="out-of-stock">Out of Stock</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="items" matSort (matSortChange)="onSortChange($event)">
              <ng-container matColumnDef="sku">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
                <td mat-cell *matCellDef="let item">{{ item.sku }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let item">{{ item.name }}</td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip>{{ item.category }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantity</th>
                <td mat-cell *matCellDef="let item">
                  <span [ngClass]="getStockClass(item)">{{ item.quantity }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="unitPrice">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Unit Price</th>
                <td mat-cell *matCellDef="let item">{{ item.unitPrice | currencyFormat }}</td>
              </ng-container>

              <ng-container matColumnDef="reorderLevel">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Reorder Level</th>
                <td mat-cell *matCellDef="let item">{{ item.reorderLevel }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let item">
                  <span class="status-badge" [ngClass]="getStatusClass(item)">
                    {{ getStockStatus(item) }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button matTooltip="View" (click)="viewItem(item)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Edit" (click)="openItemForm(item)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete" color="warn" (click)="deleteItem(item)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                  No inventory items found
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            [pageIndex]="pageIndex"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .filters mat-form-field {
      min-width: 200px;
    }
    .table-container {
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
    .status-badge.in-stock { background: #e8f5e9; color: #2e7d32; }
    .status-badge.low-stock { background: #fff3e0; color: #e65100; }
    .status-badge.out-of-stock { background: #ffebee; color: #c62828; }
    .stock-warning { color: #f57c00; font-weight: 500; }
    .stock-danger { color: #d32f2f; font-weight: 500; }
    .no-data {
      text-align: center;
      padding: 48px;
    }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  displayedColumns = ['sku', 'name', 'category', 'quantity', 'unitPrice', 'reorderLevel', 'status', 'actions'];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  categoryFilter = '';
  stockFilter = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  categories = ['Electronics', 'Furniture', 'Office Supplies', 'Hardware', 'Software'];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    const params: PaginationParams = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm
    };

    this.apiService.getPaginated<InventoryItem>('inventory', params).subscribe({
      next: (response) => {
        this.items = response.data;
        this.totalItems = response.totalCount;
      },
      error: () => {
        this.items = this.getMockItems();
        this.totalItems = this.items.length;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.pageIndex = 0;
    this.loadItems();
  }

  onCategoryFilter(category: string): void {
    this.categoryFilter = category;
    this.pageIndex = 0;
    this.loadItems();
  }

  onStockFilter(status: string): void {
    this.stockFilter = status;
    this.pageIndex = 0;
    this.loadItems();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc' || 'asc';
    this.loadItems();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadItems();
  }

  openItemForm(item?: InventoryItem): void {
    const dialogRef = this.dialog.open(InventoryFormComponent, {
      width: '600px',
      data: { item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItems();
      }
    });
  }

  viewItem(item: InventoryItem): void {
    this.openItemForm(item);
  }

  deleteItem(item: InventoryItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Item',
        message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.delete(`inventory/${item.id}`).subscribe({
          next: () => {
            this.notificationService.showSuccess('Item deleted successfully');
            this.loadItems();
          }
        });
      }
    });
  }

  getStockStatus(item: InventoryItem): string {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.reorderLevel) return 'Low Stock';
    return 'In Stock';
  }

  getStatusClass(item: InventoryItem): string {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.reorderLevel) return 'low-stock';
    return 'in-stock';
  }

  getStockClass(item: InventoryItem): string {
    if (item.quantity === 0) return 'stock-danger';
    if (item.quantity <= item.reorderLevel) return 'stock-warning';
    return '';
  }

  private getMockItems(): InventoryItem[] {
    return [
      { id: 1, sku: 'SKU-001', name: 'Laptop Dell XPS', description: 'High-performance laptop', category: 'Electronics', quantity: 25, unitPrice: 1299.99, reorderLevel: 10, isActive: true, createdAt: new Date() },
      { id: 2, sku: 'SKU-002', name: 'Office Chair', description: 'Ergonomic office chair', category: 'Furniture', quantity: 5, unitPrice: 299.99, reorderLevel: 10, isActive: true, createdAt: new Date() },
      { id: 3, sku: 'SKU-003', name: 'Monitor 27"', description: '4K monitor', category: 'Electronics', quantity: 0, unitPrice: 499.99, reorderLevel: 5, isActive: true, createdAt: new Date() },
      { id: 4, sku: 'SKU-004', name: 'Keyboard', description: 'Mechanical keyboard', category: 'Electronics', quantity: 50, unitPrice: 149.99, reorderLevel: 15, isActive: true, createdAt: new Date() }
    ];
  }
}
