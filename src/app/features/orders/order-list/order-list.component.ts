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
        subtitle="View and manage customer orders">
      </app-page-header>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="onSearch($event)" placeholder="Search orders...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="onStatusFilter($event.value)">
                <mat-option value="">All Statuses</mat-option>
                <mat-option *ngFor="let status of statuses" [value]="status">{{ status }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date Range</mat-label>
              <mat-date-range-input [rangePicker]="picker">
                <input matStartDate placeholder="Start date" (dateChange)="onDateFilter()">
                <input matEndDate placeholder="End date" (dateChange)="onDateFilter()">
              </mat-date-range-input>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-date-range-picker #picker></mat-date-range-picker>
            </mat-form-field>
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
                <td mat-cell *matCellDef="let order">{{ order.customerName }}</td>
              </ng-container>

              <ng-container matColumnDef="orderDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Order Date</th>
                <td mat-cell *matCellDef="let order">{{ order.orderDate | date:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="totalAmount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Total</th>
                <td mat-cell *matCellDef="let order">{{ order.totalAmount | currencyFormat }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let order">
                  <span class="status-badge" [ngClass]="'status-' + order.status.toLowerCase()">
                    {{ order.status }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let order">
                  <button mat-icon-button matTooltip="View Details" (click)="viewOrder(order)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="statusMenu" matTooltip="Update Status">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <mat-menu #statusMenu="matMenu">
                    <button mat-menu-item *ngFor="let status of statuses"
                            (click)="updateStatus(order, status)"
                            [disabled]="order.status === status">
                      {{ status }}
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable" (click)="viewOrder(row)"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                  No orders found
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
    .order-link {
      color: #1976d2;
      cursor: pointer;
      font-weight: 500;
    }
    .order-link:hover {
      text-decoration: underline;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-confirmed { background: #e3f2fd; color: #1565c0; }
    .status-processing { background: #f3e5f5; color: #7b1fa2; }
    .status-shipped { background: #e8eaf6; color: #3949ab; }
    .status-delivered { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .status-returned { background: #fce4ec; color: #c2185b; }
    .clickable {
      cursor: pointer;
    }
    .clickable:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .no-data {
      text-align: center;
      padding: 48px;
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

  onDateFilter(): void {
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
