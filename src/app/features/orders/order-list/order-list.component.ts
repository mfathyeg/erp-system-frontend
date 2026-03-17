import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ApiService } from '../../../core/services/api.service';
import { Order, OrderStatus, PaginationParams } from '../../../core/models';

@Component({
  selector: 'app-order-list',
  template: `
    <div class="orders-container">
      <app-page-header
        title="Orders"
        subtitle="View and manage customer orders"
        [breadcrumb]="['Dashboard', 'Orders']">
      </app-page-header>

      <div class="content-card">
        <div class="card-toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" (keyup)="onSearch($event)" placeholder="Search orders...">
          </div>

          <div class="filters">
            <select (change)="onStatusFilter($any($event.target).value)">
              <option value="">All Statuses</option>
              <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="orders" matSort (matSortChange)="onSortChange($event)">
            <ng-container matColumnDef="orderNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Order #</th>
              <td mat-cell *matCellDef="let order">
                <a class="order-link" (click)="viewOrder(order)">{{ order.orderNumber }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
              <td mat-cell *matCellDef="let order">
                <div class="customer-cell">
                  <div class="customer-avatar">{{ order.customerName.charAt(0) }}</div>
                  <span>{{ order.customerName }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="orderDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Order Date</th>
              <td mat-cell *matCellDef="let order">{{ order.orderDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
              <td mat-cell *matCellDef="let order">
                <span class="amount">{{ order.totalAmount | currencyFormat }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let order">
                <span class="status-badge" [ngClass]="'status-' + order.status.toLowerCase()">
                  <span class="status-dot"></span>
                  {{ order.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let order">
                <div class="action-buttons">
                  <button class="action-btn" matTooltip="View Details" (click)="viewOrder(order)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button class="action-btn" [matMenuTriggerFor]="statusMenu" matTooltip="Update Status">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <mat-menu #statusMenu="matMenu" class="status-menu">
                    <button mat-menu-item *ngFor="let status of statuses"
                            (click)="updateStatus(order, status)"
                            [disabled]="order.status === status">
                      <span class="menu-status-dot" [ngClass]="'dot-' + status.toLowerCase()"></span>
                      {{ status }}
                    </button>
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable" (click)="viewOrder(row)"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>shopping_cart</mat-icon>
                  <span>No orders found</span>
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

    .filters select {
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 14px;
      min-width: 160px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .order-link {
      color: var(--primary-light);
      cursor: pointer;
      font-weight: 600;
      font-family: monospace;
      transition: color 0.2s ease;
    }

    .order-link:hover {
      color: var(--primary-color);
    }

    .customer-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .customer-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gradient-purple);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
    }

    .amount {
      font-weight: 600;
      color: var(--text-primary);
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

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .status-confirmed {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .status-processing {
      background: rgba(139, 92, 246, 0.15);
      color: var(--accent-color);
    }

    .status-shipped {
      background: rgba(6, 182, 212, 0.15);
      color: #06b6d4;
    }

    .status-delivered {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .status-cancelled {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .status-returned {
      background: rgba(236, 72, 153, 0.15);
      color: #ec4899;
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

    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .menu-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .dot-pending { background: var(--warning-color); }
    .dot-confirmed { background: var(--info-color); }
    .dot-processing { background: var(--accent-color); }
    .dot-shipped { background: #06b6d4; }
    .dot-delivered { background: var(--success-color); }
    .dot-cancelled { background: var(--danger-color); }
    .dot-returned { background: #ec4899; }

    .clickable {
      cursor: pointer;
    }

    .clickable:hover {
      background: var(--card-bg-hover) !important;
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

    @media (max-width: 768px) {
      .card-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        min-width: 100%;
      }
    }
  `]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns = ['orderNumber', 'customerName', 'orderDate', 'totalAmount', 'status', 'actions'];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  statusFilter = '';
  sortBy = 'orderDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  statuses = Object.values(OrderStatus);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const params: PaginationParams = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm
    };

    this.apiService.getPaginated<Order>('orders', params).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.totalItems = response.totalCount;
      },
      error: () => {
        this.orders = this.getMockOrders();
        this.totalItems = this.orders.length;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.pageIndex = 0;
    this.loadOrders();
  }

  onStatusFilter(status: string): void {
    this.statusFilter = status;
    this.pageIndex = 0;
    this.loadOrders();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc' || 'desc';
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  viewOrder(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.apiService.patch(`orders/${order.id}/status`, { status }).subscribe({
      next: () => {
        this.loadOrders();
      }
    });
  }

  private getMockOrders(): Order[] {
    return [
      { id: 1, orderNumber: 'ORD-2024-001', customerId: 1, customerName: 'John Doe', status: OrderStatus.Pending, orderDate: new Date(), totalAmount: 1250.00, shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' }, billingAddress: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' }, items: [], createdAt: new Date() },
      { id: 2, orderNumber: 'ORD-2024-002', customerId: 2, customerName: 'Jane Smith', status: OrderStatus.Processing, orderDate: new Date(), totalAmount: 890.50, shippingAddress: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA' }, billingAddress: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA' }, items: [], createdAt: new Date() },
      { id: 3, orderNumber: 'ORD-2024-003', customerId: 3, customerName: 'Bob Johnson', status: OrderStatus.Shipped, orderDate: new Date(), totalAmount: 2100.00, shippingAddress: { street: '789 Pine Rd', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'USA' }, billingAddress: { street: '789 Pine Rd', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'USA' }, items: [], createdAt: new Date() },
      { id: 4, orderNumber: 'ORD-2024-004', customerId: 4, customerName: 'Alice Brown', status: OrderStatus.Delivered, orderDate: new Date(), totalAmount: 450.75, shippingAddress: { street: '321 Elm St', city: 'Houston', state: 'TX', postalCode: '77001', country: 'USA' }, billingAddress: { street: '321 Elm St', city: 'Houston', state: 'TX', postalCode: '77001', country: 'USA' }, items: [], createdAt: new Date() }
    ];
  }
}
