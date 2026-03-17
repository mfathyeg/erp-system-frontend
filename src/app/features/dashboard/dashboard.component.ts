import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <app-page-header title="Dashboard" subtitle="Overview of your ERP system"></app-page-header>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon orders">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.totalOrders || 0 }}</span>
              <span class="stat-label">Total Orders</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon pending">
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.pendingOrders || 0 }}</span>
              <span class="stat-label">Pending Orders</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon revenue">
              <mat-icon>attach_money</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.totalRevenue | currencyFormat }}</span>
              <span class="stat-label">Total Revenue</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon inventory">
              <mat-icon>warning</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.lowStockItems || 0 }}</span>
              <span class="stat-label">Low Stock Items</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="charts-row">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Recent Orders</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="stats?.recentOrders || []" class="recent-orders-table">
              <ng-container matColumnDef="orderNumber">
                <th mat-header-cell *matHeaderCellDef>Order #</th>
                <td mat-cell *matCellDef="let order">{{ order.orderNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="customerName">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let order">{{ order.customerName }}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let order">{{ order.amount | currencyFormat }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let order">
                  <span class="status-badge" [ngClass]="'status-' + order.status.toLowerCase()">
                    {{ order.status }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let order">{{ order.date | date:'short' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="recentOrderColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: recentOrderColumns;"></tr>
            </table>

            <div class="view-all">
              <a mat-button color="primary" routerLink="/orders">View All Orders</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Order Status Distribution</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-distribution">
              <div class="status-item" *ngFor="let status of stats?.orderStatusDistribution">
                <div class="status-bar">
                  <div class="status-fill"
                       [ngClass]="'status-' + status.status.toLowerCase()"
                       [style.width]="getStatusPercentage(status.count) + '%'">
                  </div>
                </div>
                <div class="status-details">
                  <span class="status-name">{{ status.status }}</span>
                  <span class="status-count">{{ status.count }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="bottom-row">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Top Products</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let product of stats?.topProducts; let i = index">
                <span matListItemTitle>
                  <span class="rank">{{ i + 1 }}</span>
                  {{ product.productName }}
                </span>
                <span matListItemLine>
                  {{ product.totalSold }} sold - {{ product.revenue | currencyFormat }}
                </span>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Monthly Sales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="sales-chart">
              <div class="chart-bar" *ngFor="let sale of stats?.salesByMonth">
                <div class="bar-fill" [style.height]="getSalesHeight(sale.revenue) + '%'"></div>
                <span class="bar-label">{{ sale.month }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px !important;
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }
    .stat-icon.orders { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-icon.pending { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-icon.revenue { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .stat-icon.inventory { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 600;
    }
    .stat-label {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
    .charts-row, .bottom-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    .chart-card {
      min-height: 300px;
    }
    .recent-orders-table {
      width: 100%;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-processing { background: #e3f2fd; color: #1565c0; }
    .status-shipped { background: #e8f5e9; color: #2e7d32; }
    .status-delivered { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .view-all {
      text-align: center;
      margin-top: 16px;
    }
    .status-distribution {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .status-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .status-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    .status-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .status-fill.status-pending { background: #ff9800; }
    .status-fill.status-processing { background: #2196f3; }
    .status-fill.status-shipped { background: #9c27b0; }
    .status-fill.status-delivered { background: #4caf50; }
    .status-fill.status-cancelled { background: #f44336; }
    .status-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    .status-name {
      color: rgba(0, 0, 0, 0.6);
    }
    .status-count {
      font-weight: 500;
    }
    .rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #e3f2fd;
      border-radius: 50%;
      margin-right: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #1976d2;
    }
    .sales-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 200px;
      padding: 16px 0;
    }
    .chart-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    .bar-fill {
      width: 32px;
      background: linear-gradient(180deg, #1976d2 0%, #64b5f6 100%);
      border-radius: 4px 4px 0 0;
      transition: height 0.3s ease;
    }
    .bar-label {
      margin-top: 8px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    @media (max-width: 600px) {
      .charts-row, .bottom-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentOrderColumns = ['orderNumber', 'customerName', 'amount', 'status', 'date'];
  maxRevenue = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.apiService.get<DashboardStats>('dashboard/stats').subscribe({
      next: (stats) => {
        this.stats = stats;
        if (stats?.salesByMonth) {
          this.maxRevenue = Math.max(...stats.salesByMonth.map(s => s.revenue));
        }
      },
      error: () => {
        this.stats = this.getMockStats();
        this.maxRevenue = Math.max(...this.stats.salesByMonth.map(s => s.revenue));
      }
    });
  }

  getStatusPercentage(count: number): number {
    if (!this.stats?.orderStatusDistribution) return 0;
    const total = this.stats.orderStatusDistribution.reduce((sum, s) => sum + s.count, 0);
    return total > 0 ? (count / total) * 100 : 0;
  }

  getSalesHeight(revenue: number): number {
    return this.maxRevenue > 0 ? (revenue / this.maxRevenue) * 100 : 0;
  }

  private getMockStats(): DashboardStats {
    return {
      totalOrders: 1234,
      pendingOrders: 56,
      totalRevenue: 125000,
      totalCustomers: 890,
      lowStockItems: 12,
      recentOrders: [
        { id: 1, orderNumber: 'ORD-001', customerName: 'John Doe', amount: 250, status: 'Pending', date: new Date() },
        { id: 2, orderNumber: 'ORD-002', customerName: 'Jane Smith', amount: 180, status: 'Processing', date: new Date() },
        { id: 3, orderNumber: 'ORD-003', customerName: 'Bob Johnson', amount: 520, status: 'Shipped', date: new Date() },
        { id: 4, orderNumber: 'ORD-004', customerName: 'Alice Brown', amount: 95, status: 'Delivered', date: new Date() },
        { id: 5, orderNumber: 'ORD-005', customerName: 'Charlie Wilson', amount: 340, status: 'Pending', date: new Date() }
      ],
      salesByMonth: [
        { month: 'Jan', revenue: 12000, orders: 120 },
        { month: 'Feb', revenue: 15000, orders: 150 },
        { month: 'Mar', revenue: 18000, orders: 180 },
        { month: 'Apr', revenue: 14000, orders: 140 },
        { month: 'May', revenue: 22000, orders: 220 },
        { month: 'Jun', revenue: 19000, orders: 190 }
      ],
      topProducts: [
        { productId: 1, productName: 'Product A', totalSold: 450, revenue: 22500 },
        { productId: 2, productName: 'Product B', totalSold: 380, revenue: 19000 },
        { productId: 3, productName: 'Product C', totalSold: 320, revenue: 16000 },
        { productId: 4, productName: 'Product D', totalSold: 280, revenue: 14000 },
        { productId: 5, productName: 'Product E', totalSold: 220, revenue: 11000 }
      ],
      orderStatusDistribution: [
        { status: 'Pending', count: 45 },
        { status: 'Processing', count: 32 },
        { status: 'Shipped', count: 28 },
        { status: 'Delivered', count: 156 },
        { status: 'Cancelled', count: 8 }
      ]
    };
  }
}
