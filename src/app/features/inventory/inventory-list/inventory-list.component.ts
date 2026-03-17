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
        subtitle="Manage your inventory items and stock levels"
        [breadcrumb]="['Dashboard', 'Inventory']"
        [showAddButton]="true"
        addButtonText="Add Item"
        (onAdd)="openItemForm()">
      </app-page-header>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon primary">
            <mat-icon>inventory_2</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ totalItems }}</span>
            <span class="stat-label">Total Items</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ inStockCount }}</span>
            <span class="stat-label">In Stock</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <mat-icon>warning</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ lowStockCount }}</span>
            <span class="stat-label">Low Stock</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <mat-icon>error</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ outOfStockCount }}</span>
            <span class="stat-label">Out of Stock</span>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" (keyup)="onSearch($event)" placeholder="Search items...">
          </div>

          <div class="filters">
            <select (change)="onCategoryFilter($any($event.target).value)">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>

            <select (change)="onStockFilter($any($event.target).value)">
              <option value="">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="items" matSort (matSortChange)="onSortChange($event)">
            <ng-container matColumnDef="sku">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
              <td mat-cell *matCellDef="let item">
                <span class="sku-code">{{ item.sku }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Product</th>
              <td mat-cell *matCellDef="let item">
                <div class="product-cell">
                  <div class="product-icon">
                    <mat-icon>inventory_2</mat-icon>
                  </div>
                  <div class="product-info">
                    <span class="product-name">{{ item.name }}</span>
                    <span class="product-desc">{{ item.description | truncate:30 }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
              <td mat-cell *matCellDef="let item">
                <span class="category-badge">{{ item.category }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantity</th>
              <td mat-cell *matCellDef="let item">
                <div class="quantity-cell">
                  <span [ngClass]="getStockClass(item)">{{ item.quantity }}</span>
                  <div class="stock-bar">
                    <div class="stock-fill" [ngClass]="getStatusClass(item)" [style.width.%]="getStockPercentage(item)"></div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="unitPrice">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Unit Price</th>
              <td mat-cell *matCellDef="let item">{{ item.unitPrice | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let item">
                <span class="status-badge" [ngClass]="getStatusClass(item)">
                  <span class="status-dot"></span>
                  {{ getStockStatus(item) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item">
                <div class="action-buttons">
                  <button class="action-btn" matTooltip="View" (click)="viewItem(item)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button class="action-btn" matTooltip="Edit" (click)="openItemForm(item)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="action-btn danger" matTooltip="Delete" (click)="deleteItem(item)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>inventory_2</mat-icon>
                  <span>No inventory items found</span>
                </div>
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
      </div>
    </div>
  `,
  styles: [`
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.primary {
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary-color);
    }

    .stat-icon.success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .stat-icon.warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .stat-icon.danger {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
    }

    .content-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }

    .card-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 16px;
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
    }

    .search-box:focus-within {
      border-color: var(--primary-color);
    }

    .search-box mat-icon {
      color: var(--text-muted);
    }

    .search-box input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 14px;
    }

    .filters {
      display: flex;
      gap: 12px;
    }

    .filters select {
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 14px;
      min-width: 140px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .sku-code {
      font-family: monospace;
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--secondary-bg);
      padding: 4px 8px;
      border-radius: 6px;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .product-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--secondary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }

    .product-info {
      display: flex;
      flex-direction: column;
    }

    .product-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .product-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    .category-badge {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      background: var(--secondary-bg);
      color: var(--text-secondary);
    }

    .quantity-cell {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stock-bar {
      width: 60px;
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
      overflow: hidden;
    }

    .stock-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .stock-fill.in-stock { background: var(--success-color); }
    .stock-fill.low-stock { background: var(--warning-color); }
    .stock-fill.out-of-stock { background: var(--danger-color); }

    .stock-warning {
      color: var(--warning-color);
      font-weight: 500;
    }

    .stock-danger {
      color: var(--danger-color);
      font-weight: 500;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.in-stock {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .status-badge.low-stock {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .status-badge.out-of-stock {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
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
      color: var(--primary-color);
    }

    .action-btn.danger:hover {
      color: var(--danger-color);
    }

    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: var(--text-muted);
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .no-data {
      text-align: center;
    }

    @media (max-width: 1024px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: 1fr;
      }

      .card-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        min-width: 100%;
      }

      .filters {
        flex-wrap: wrap;
      }
    }
  `]
})
export class InventoryListComponent implements OnInit {
  items: InventoryItem[] = [];
  displayedColumns = ['sku', 'name', 'category', 'quantity', 'unitPrice', 'status', 'actions'];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  categoryFilter = '';
  stockFilter = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  categories = ['Electronics', 'Furniture', 'Office Supplies', 'Hardware', 'Software'];

  inStockCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

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
        this.calculateStockCounts();
      },
      error: () => {
        this.items = this.getMockItems();
        this.totalItems = this.items.length;
        this.calculateStockCounts();
      }
    });
  }

  calculateStockCounts(): void {
    this.inStockCount = this.items.filter(i => i.quantity > i.reorderLevel).length;
    this.lowStockCount = this.items.filter(i => i.quantity > 0 && i.quantity <= i.reorderLevel).length;
    this.outOfStockCount = this.items.filter(i => i.quantity === 0).length;
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
        type: 'danger'
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

  getStockPercentage(item: InventoryItem): number {
    const maxStock = item.reorderLevel * 3;
    return Math.min((item.quantity / maxStock) * 100, 100);
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
