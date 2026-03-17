import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Order, OrderStatus } from '../../../core/models';

@Component({
  selector: 'app-order-details',
  template: `
    <div class="order-details-container" *ngIf="order">
      <app-page-header [title]="'Order ' + order.orderNumber" subtitle="Order details and management">
        <div actions>
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> Back to Orders
          </button>
        </div>
      </app-page-header>

      <div class="details-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Order Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Order Number</span>
                <span class="value">{{ order.orderNumber }}</span>
              </div>
              <div class="info-item">
                <span class="label">Order Date</span>
                <span class="value">{{ order.orderDate | date:'medium' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Status</span>
                <span class="status-badge" [ngClass]="'status-' + order.status.toLowerCase()">
                  {{ order.status }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Total Amount</span>
                <span class="value total">{{ order.totalAmount | currencyFormat }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="status-actions">
              <span class="label">Update Status:</span>
              <div class="status-buttons">
                <button mat-stroked-button *ngFor="let status of statuses"
                        [color]="order.status === status ? 'primary' : ''"
                        [disabled]="order.status === status"
                        (click)="updateStatus(status)">
                  {{ status }}
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Customer Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item full-width">
                <span class="label">Customer Name</span>
                <span class="value">{{ order.customerName }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="addresses">
              <div class="address-section">
                <h4>Shipping Address</h4>
                <p>{{ order.shippingAddress.street }}</p>
                <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
                <p>{{ order.shippingAddress.country }}</p>
              </div>
              <div class="address-section">
                <h4>Billing Address</h4>
                <p>{{ order.billingAddress.street }}</p>
                <p>{{ order.billingAddress.city }}, {{ order.billingAddress.state }} {{ order.billingAddress.postalCode }}</p>
                <p>{{ order.billingAddress.country }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="items-card">
        <mat-card-header>
          <mat-card-title>Order Items</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="order.items" class="items-table">
            <ng-container matColumnDef="productName">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
            </ng-container>

            <ng-container matColumnDef="sku">
              <th mat-header-cell *matHeaderCellDef>SKU</th>
              <td mat-cell *matCellDef="let item">{{ item.sku }}</td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
            </ng-container>

            <ng-container matColumnDef="unitPrice">
              <th mat-header-cell *matHeaderCellDef>Unit Price</th>
              <td mat-cell *matCellDef="let item">{{ item.unitPrice | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="discount">
              <th mat-header-cell *matHeaderCellDef>Discount</th>
              <td mat-cell *matCellDef="let item">{{ item.discount | currencyFormat }}</td>
            </ng-container>

            <ng-container matColumnDef="totalPrice">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let item">{{ item.totalPrice | currencyFormat }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
          </table>

          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ getSubtotal() | currencyFormat }}</span>
            </div>
            <div class="summary-row">
              <span>Total Discount:</span>
              <span>-{{ getTotalDiscount() | currencyFormat }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ order.totalAmount | currencyFormat }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="notes-card" *ngIf="order.notes">
        <mat-card-header>
          <mat-card-title>Order Notes</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ order.notes }}</p>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading" *ngIf="!order">
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: [`
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    .info-card, .items-card, .notes-card {
      margin-bottom: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 16px 0;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-item.full-width {
      grid-column: 1 / -1;
    }
    .label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
    }
    .value {
      font-size: 16px;
      font-weight: 500;
    }
    .value.total {
      font-size: 24px;
      color: #1976d2;
    }
    .status-badge {
      display: inline-block;
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
    .status-actions {
      padding: 16px 0;
    }
    .status-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .addresses {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      padding: 16px 0;
    }
    .address-section h4 {
      margin: 0 0 8px;
      font-weight: 500;
    }
    .address-section p {
      margin: 0;
      color: rgba(0, 0, 0, 0.7);
    }
    .items-table {
      width: 100%;
    }
    .order-summary {
      max-width: 300px;
      margin-left: auto;
      padding: 16px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .summary-row.total {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }
    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    @media (max-width: 600px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
      .addresses {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  itemColumns = ['productName', 'sku', 'quantity', 'unitPrice', 'discount', 'totalPrice'];
  statuses = Object.values(OrderStatus);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    this.loadOrder(orderId);
  }

  loadOrder(id: number): void {
    this.apiService.get<Order>(`orders/${id}`).subscribe({
      next: (order) => {
        this.order = order;
      },
      error: () => {
        this.order = this.getMockOrder(id);
      }
    });
  }

  updateStatus(status: OrderStatus): void {
    if (!this.order) return;

    this.apiService.patch(`orders/${this.order.id}/status`, { status }).subscribe({
      next: () => {
        this.order!.status = status;
        this.notificationService.showSuccess(`Order status updated to ${status}`);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getSubtotal(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getTotalDiscount(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((sum, item) => sum + item.discount, 0);
  }

  private getMockOrder(id: number): Order {
    return {
      id,
      orderNumber: `ORD-2024-00${id}`,
      customerId: 1,
      customerName: 'John Doe',
      status: OrderStatus.Processing,
      orderDate: new Date(),
      totalAmount: 1250.00,
      shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
      billingAddress: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
      items: [
        { id: 1, orderId: id, productId: 1, productName: 'Laptop Dell XPS', sku: 'SKU-001', quantity: 1, unitPrice: 1299.99, discount: 100, totalPrice: 1199.99 },
        { id: 2, orderId: id, productId: 2, productName: 'Wireless Mouse', sku: 'SKU-010', quantity: 2, unitPrice: 25.00, discount: 0, totalPrice: 50.00 }
      ],
      notes: 'Please deliver before 5 PM.',
      createdAt: new Date()
    };
  }
}
