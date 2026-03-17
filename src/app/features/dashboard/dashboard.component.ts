import { Component, OnInit } from '@angular/core';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  gradient: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  avatar: string;
  product: string;
  amount: number;
  status: string;
  date: Date;
}

interface TopProduct {
  name: string;
  category: string;
  sales: number;
  revenue: number;
  progress: number;
  trend: 'up' | 'down';
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  tasks: number;
  completedTasks: number;
  status: 'online' | 'busy' | 'offline';
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>Welcome back, John!</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        <div class="header-actions">
          <button class="btn-outline">
            <mat-icon>download</mat-icon>
            Export Report
          </button>
          <button class="btn-gradient">
            <mat-icon>add</mat-icon>
            New Order
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let stat of stats" [class]="stat.gradient">
          <div class="stat-content">
            <div class="stat-info">
              <span class="stat-title">{{ stat.title }}</span>
              <h2 class="stat-value">{{ stat.value }}</h2>
              <div class="stat-change" [class.positive]="stat.change > 0" [class.negative]="stat.change < 0">
                <mat-icon>{{ stat.change > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                <span>{{ stat.change > 0 ? '+' : '' }}{{ stat.change }}% {{ stat.changeLabel }}</span>
              </div>
            </div>
            <div class="stat-icon-wrapper" [class]="stat.gradient">
              <mat-icon>{{ stat.icon }}</mat-icon>
            </div>
          </div>
          <div class="stat-chart">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none">
              <path [attr.d]="getSparkline()" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent Orders -->
        <div class="card orders-card">
          <div class="card-header">
            <h3>Recent Orders</h3>
            <button class="btn-text">View All</button>
          </div>
          <div class="orders-table">
            <div class="order-row" *ngFor="let order of recentOrders">
              <div class="order-customer">
                <img [src]="order.avatar" [alt]="order.customer" class="avatar">
                <div class="customer-info">
                  <span class="customer-name">{{ order.customer }}</span>
                  <span class="order-id">{{ order.id }}</span>
                </div>
              </div>
              <div class="order-product">{{ order.product }}</div>
              <div class="order-amount">{{ order.amount | currency }}</div>
              <div class="order-status">
                <span class="status-badge" [class]="order.status.toLowerCase()">{{ order.status }}</span>
              </div>
              <div class="order-date">{{ order.date | date:'MMM d' }}</div>
              <button class="action-btn">
                <mat-icon>more_vert</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h3>Revenue Overview</h3>
              <p class="card-subtitle">Monthly revenue comparison</p>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="dot primary"></span> This Year</span>
              <span class="legend-item"><span class="dot secondary"></span> Last Year</span>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-bars">
              <div class="bar-group" *ngFor="let month of chartData">
                <div class="bar primary" [style.height]="month.current + '%'"></div>
                <div class="bar secondary" [style.height]="month.previous + '%'"></div>
                <span class="bar-label">{{ month.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="card products-card">
          <div class="card-header">
            <h3>Top Products</h3>
            <button class="btn-text">View All</button>
          </div>
          <div class="products-list">
            <div class="product-item" *ngFor="let product of topProducts">
              <div class="product-info">
                <span class="product-name">{{ product.name }}</span>
                <span class="product-category">{{ product.category }}</span>
              </div>
              <div class="product-stats">
                <div class="product-sales">
                  <span class="sales-count">{{ product.sales }}</span>
                  <span class="sales-label">sales</span>
                </div>
                <div class="product-revenue">{{ product.revenue | currency }}</div>
              </div>
              <div class="product-progress">
                <div class="progress-bar">
                  <div class="progress-fill primary" [style.width]="product.progress + '%'"></div>
                </div>
                <span class="progress-value" [class.up]="product.trend === 'up'" [class.down]="product.trend === 'down'">
                  <mat-icon>{{ product.trend === 'up' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                  {{ product.progress }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Performance -->
        <div class="card team-card">
          <div class="card-header">
            <h3>Team Performance</h3>
            <button class="btn-text">View All</button>
          </div>
          <div class="team-list">
            <div class="team-member" *ngFor="let member of teamMembers">
              <div class="member-info">
                <div class="member-avatar">
                  <img [src]="member.avatar" [alt]="member.name">
                  <span class="status-dot" [class]="member.status"></span>
                </div>
                <div class="member-details">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-role">{{ member.role }}</span>
                </div>
              </div>
              <div class="member-tasks">
                <div class="tasks-progress">
                  <span class="tasks-count">{{ member.completedTasks }}/{{ member.tasks }}</span>
                  <div class="progress-bar small">
                    <div class="progress-fill success" [style.width]="(member.completedTasks / member.tasks * 100) + '%'"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-content h1 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .header-content p {
      margin: 0;
      color: var(--text-muted);
      font-size: 15px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-outline {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      background: transparent;
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-outline:hover {
      background: var(--card-bg);
      border-color: var(--primary-color);
    }

    .btn-gradient {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      background: var(--gradient-primary);
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-gradient:hover {
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
    }

    .btn-text {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      z-index: 1;
    }

    .stat-title {
      font-size: 13px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      margin: 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
    }

    .stat-change mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .stat-change.positive { color: var(--success-color); }
    .stat-change.negative { color: var(--danger-color); }

    .stat-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .stat-icon-wrapper.primary { background: var(--gradient-primary); }
    .stat-icon-wrapper.success { background: var(--gradient-success); }
    .stat-icon-wrapper.warning { background: var(--gradient-warning); }
    .stat-icon-wrapper.info { background: var(--gradient-info); }
    .stat-icon-wrapper.purple { background: var(--gradient-purple); }
    .stat-icon-wrapper.pink { background: var(--gradient-pink); }

    .stat-chart {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      opacity: 0.5;
    }

    .stat-chart svg {
      width: 100%;
      height: 100%;
    }

    .stat-card.primary .stat-chart { color: var(--primary-color); }
    .stat-card.success .stat-chart { color: var(--success-color); }
    .stat-card.warning .stat-chart { color: var(--warning-color); }
    .stat-card.info .stat-chart { color: var(--info-color); }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 24px;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: var(--text-muted);
    }

    /* Orders Table */
    .orders-card {
      grid-column: 1 / 2;
    }

    .order-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1fr 0.8fr 40px;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .order-row:last-child {
      border-bottom: none;
    }

    .order-customer {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      object-fit: cover;
    }

    .customer-info {
      display: flex;
      flex-direction: column;
    }

    .customer-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .order-id {
      font-size: 12px;
      color: var(--text-muted);
    }

    .order-product {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .order-amount {
      font-weight: 600;
      color: var(--text-primary);
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning-color); }
    .status-badge.processing { background: rgba(59, 130, 246, 0.15); color: var(--info-color); }
    .status-badge.shipped { background: rgba(139, 92, 246, 0.15); color: var(--accent-color); }
    .status-badge.delivered { background: rgba(16, 185, 129, 0.15); color: var(--success-color); }
    .status-badge.cancelled { background: rgba(239, 68, 68, 0.15); color: var(--danger-color); }

    .order-date {
      color: var(--text-muted);
      font-size: 13px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--card-bg-hover);
      color: var(--text-primary);
    }

    /* Chart Card */
    .chart-card {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
    }

    .chart-legend {
      display: flex;
      gap: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot.primary { background: var(--primary-color); }
    .dot.secondary { background: var(--border-light); }

    .chart-container {
      height: 200px;
      margin-top: 16px;
    }

    .chart-bars {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 100%;
      gap: 8px;
    }

    .bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      height: 100%;
    }

    .bar-group .bar {
      width: 100%;
      max-width: 24px;
      border-radius: 4px;
      transition: height 0.5s ease;
    }

    .bar.primary { background: var(--gradient-primary); }
    .bar.secondary { background: var(--border-light); }

    .bar-label {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Products Card */
    .products-card {
      grid-column: 1 / 2;
    }

    .product-item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .product-item:last-child {
      border-bottom: none;
    }

    .product-name {
      font-weight: 500;
      color: var(--text-primary);
      display: block;
    }

    .product-category {
      font-size: 12px;
      color: var(--text-muted);
    }

    .product-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .sales-count {
      font-weight: 600;
      color: var(--text-primary);
    }

    .sales-label {
      font-size: 11px;
      color: var(--text-muted);
    }

    .product-revenue {
      font-size: 12px;
      color: var(--text-muted);
    }

    .product-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--border-color);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar.small {
      height: 4px;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .progress-fill.primary { background: var(--gradient-primary); }
    .progress-fill.success { background: var(--gradient-success); }

    .progress-value {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 500;
      min-width: 50px;
    }

    .progress-value mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .progress-value.up { color: var(--success-color); }
    .progress-value.down { color: var(--danger-color); }

    /* Team Card */
    .team-card {
      grid-column: 2 / 3;
    }

    .team-member {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .team-member:last-child {
      border-bottom: none;
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .member-avatar {
      position: relative;
      width: 40px;
      height: 40px;
    }

    .member-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 10px;
      object-fit: cover;
    }

    .status-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--card-bg);
    }

    .status-dot.online { background: var(--success-color); }
    .status-dot.busy { background: var(--warning-color); }
    .status-dot.offline { background: var(--text-muted); }

    .member-name {
      font-weight: 500;
      color: var(--text-primary);
      display: block;
    }

    .member-role {
      font-size: 12px;
      color: var(--text-muted);
    }

    .tasks-progress {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      min-width: 100px;
    }

    .tasks-count {
      font-size: 12px;
      color: var(--text-secondary);
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .orders-card,
      .chart-card,
      .products-card,
      .team-card {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .order-row {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [
    { title: 'Total Revenue', value: '$45,231', change: 12.5, changeLabel: 'from last month', icon: 'account_balance_wallet', gradient: 'primary' },
    { title: 'Total Orders', value: '1,234', change: 8.2, changeLabel: 'from last month', icon: 'shopping_cart', gradient: 'success' },
    { title: 'New Customers', value: '456', change: -2.4, changeLabel: 'from last month', icon: 'people', gradient: 'warning' },
    { title: 'Conversion Rate', value: '3.24%', change: 4.1, changeLabel: 'from last month', icon: 'trending_up', gradient: 'info' }
  ];

  recentOrders: RecentOrder[] = [
    { id: '#ORD-7352', customer: 'Sarah Johnson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff', product: 'MacBook Pro 16"', amount: 2499, status: 'Delivered', date: new Date() },
    { id: '#ORD-7351', customer: 'Michael Chen', avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff', product: 'iPhone 15 Pro', amount: 1199, status: 'Processing', date: new Date(Date.now() - 86400000) },
    { id: '#ORD-7350', customer: 'Emily Davis', avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=f59e0b&color=fff', product: 'AirPods Pro', amount: 249, status: 'Shipped', date: new Date(Date.now() - 172800000) },
    { id: '#ORD-7349', customer: 'James Wilson', avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=ef4444&color=fff', product: 'iPad Air', amount: 799, status: 'Pending', date: new Date(Date.now() - 259200000) },
    { id: '#ORD-7348', customer: 'Lisa Anderson', avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=8b5cf6&color=fff', product: 'Apple Watch', amount: 399, status: 'Delivered', date: new Date(Date.now() - 345600000) }
  ];

  topProducts: TopProduct[] = [
    { name: 'MacBook Pro 16"', category: 'Laptops', sales: 234, revenue: 584766, progress: 85, trend: 'up' },
    { name: 'iPhone 15 Pro Max', category: 'Smartphones', sales: 189, revenue: 226611, progress: 72, trend: 'up' },
    { name: 'iPad Pro 12.9"', category: 'Tablets', sales: 156, revenue: 171444, progress: 63, trend: 'down' },
    { name: 'AirPods Pro', category: 'Audio', sales: 312, revenue: 77688, progress: 91, trend: 'up' }
  ];

  teamMembers: TeamMember[] = [
    { name: 'Alex Thompson', role: 'Sales Manager', avatar: 'https://ui-avatars.com/api/?name=Alex+Thompson&background=6366f1&color=fff', tasks: 12, completedTasks: 10, status: 'online' },
    { name: 'Maria Garcia', role: 'Marketing Lead', avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=10b981&color=fff', tasks: 8, completedTasks: 6, status: 'busy' },
    { name: 'David Kim', role: 'Developer', avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=f59e0b&color=fff', tasks: 15, completedTasks: 14, status: 'online' },
    { name: 'Sophie Martin', role: 'Designer', avatar: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=ec4899&color=fff', tasks: 10, completedTasks: 8, status: 'offline' }
  ];

  chartData = [
    { label: 'Jan', current: 65, previous: 45 },
    { label: 'Feb', current: 75, previous: 55 },
    { label: 'Mar', current: 55, previous: 65 },
    { label: 'Apr', current: 85, previous: 50 },
    { label: 'May', current: 70, previous: 60 },
    { label: 'Jun', current: 90, previous: 70 }
  ];

  ngOnInit(): void {}

  getSparkline(): string {
    const points = [5, 15, 10, 20, 12, 25, 18, 28, 22, 30];
    return points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 11} ${30 - y}`).join(' ');
  }
}
