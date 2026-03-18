import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '../../core/services/notification.service';
import { SignalRService } from '../../core/services/signalr.service';
import { Notification, NotificationType, PaginationParams } from '../../core/models';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications-container">
      <app-page-header
        title="الإشعارات"
        subtitle="عرض وإدارة الإشعارات الخاصة بك"
        [breadcrumb]="['لوحة التحكم', 'الإشعارات']">
        <div actions>
          <span class="connection-status" [ngClass]="connectionState.toLowerCase()">
            <span class="status-dot"></span>
            {{ getConnectionStateArabic(connectionState) }}
          </span>
          <button class="btn-mark-all" (click)="markAllAsRead()" [disabled]="unreadCount === 0">
            <mat-icon>done_all</mat-icon>
            تحديد الكل كمقروء
          </button>
        </div>
      </app-page-header>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-chips">
          <button class="filter-chip" [class.active]="typeFilter === ''" (click)="onFilterChange('')">
            الكل
            <span class="chip-count">{{ totalItems }}</span>
          </button>
          <button class="filter-chip" *ngFor="let type of notificationTypes"
                  [class.active]="typeFilter === type"
                  (click)="onFilterChange(type)">
            {{ getTypeArabic(type) }}
          </button>
        </div>

        <label class="toggle-switch">
          <input type="checkbox" [(ngModel)]="showUnreadOnly" (change)="loadNotifications()">
          <span class="toggle-slider"></span>
          <span class="toggle-label">غير المقروءة فقط</span>
        </label>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list" *ngIf="notifications.length > 0">
        <div class="notification-card"
             *ngFor="let notification of notifications"
             [class.unread]="!notification.isRead"
             (click)="markAsRead(notification)">
          <div class="notification-icon" [ngClass]="'icon-' + notification.type.toLowerCase()">
            <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <h4>{{ notification.title }}</h4>
              <span class="notification-time">{{ notification.createdAt | dateAgo }}</span>
            </div>
            <p>{{ notification.message }}</p>
            <div class="notification-footer">
              <span class="notification-type" [ngClass]="'type-' + notification.type.toLowerCase()">
                {{ getTypeArabic(notification.type) }}
              </span>
              <div class="notification-actions" (click)="$event.stopPropagation()">
                <button class="action-btn" matTooltip="تحديد كمقروء" *ngIf="!notification.isRead"
                        (click)="markAsRead(notification)">
                  <mat-icon>check</mat-icon>
                </button>
                <button class="action-btn danger" matTooltip="حذف"
                        (click)="deleteNotification(notification)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="unread-indicator" *ngIf="!notification.isRead"></div>
        </div>
      </div>

      <!-- Empty State -->
      <app-empty-state
        *ngIf="notifications.length === 0"
        icon="notifications_none"
        title="لا توجد إشعارات"
        message="أنت على اطلاع! ستظهر الإشعارات الجديدة هنا."
        color="primary">
      </app-empty-state>

      <!-- Paginator -->
      <mat-paginator
        *ngIf="totalItems > pageSize"
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 25, 50]"
        [pageIndex]="pageIndex"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      color: var(--text-secondary);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-chip:hover {
      background: var(--card-bg-hover);
    }

    .filter-chip.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .chip-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
    }

    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .toggle-switch input {
      display: none;
    }

    .toggle-slider {
      width: 44px;
      height: 24px;
      background: var(--border-light);
      border-radius: 12px;
      position: relative;
      transition: all 0.3s ease;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      background: white;
      border-radius: 50%;
      top: 3px;
      left: 3px;
      transition: all 0.3s ease;
    }

    .toggle-switch input:checked + .toggle-slider {
      background: var(--primary-color);
    }

    .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }

    .toggle-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .connection-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      margin-left: 12px;
      margin-right: 0;
    }

    .connection-status .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    .connection-status.connected {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .connection-status.disconnected,
    .connection-status.reconnecting {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .btn-mark-all {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-secondary);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-mark-all:hover:not(:disabled) {
      background: var(--card-bg-hover);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .btn-mark-all:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notification-card {
      display: flex;
      gap: 16px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .notification-card:hover {
      transform: translateX(-4px);
      box-shadow: var(--shadow-lg);
    }

    .notification-card.unread {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--card-bg) 100%);
      border-right: 3px solid var(--primary-color);
      border-left: none;
    }

    .notification-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon mat-icon {
      color: white;
      font-size: 24px;
    }

    .icon-info { background: var(--gradient-info); }
    .icon-success { background: var(--gradient-success); }
    .icon-warning { background: var(--gradient-warning); }
    .icon-error { background: var(--gradient-danger); }
    .icon-order { background: var(--gradient-purple); }
    .icon-inventory { background: var(--gradient-cyan); }
    .icon-system { background: linear-gradient(135deg, #607d8b 0%, #78909c 100%); }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .notification-header h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .notification-time {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .notification-content p {
      margin: 0 0 12px;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .notification-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notification-type {
      display: inline-flex;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .type-info { background: rgba(59, 130, 246, 0.15); color: var(--info-color); }
    .type-success { background: rgba(16, 185, 129, 0.15); color: var(--success-color); }
    .type-warning { background: rgba(245, 158, 11, 0.15); color: var(--warning-color); }
    .type-error { background: rgba(239, 68, 68, 0.15); color: var(--danger-color); }
    .type-order { background: rgba(139, 92, 246, 0.15); color: var(--accent-color); }
    .type-inventory { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
    .type-system { background: rgba(96, 125, 139, 0.15); color: #607d8b; }

    .notification-actions {
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

    .unread-indicator {
      position: absolute;
      top: 20px;
      left: 20px;
      right: auto;
      width: 10px;
      height: 10px;
      background: var(--primary-color);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary-color);
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  typeFilter = '';
  showUnreadOnly = false;
  unreadCount = 0;
  connectionState = 'Disconnected';
  notificationTypes = Object.values(NotificationType);

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.subscribeToRealTime();
    this.subscribeToConnectionState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    const params: PaginationParams = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize
    };

    this.notificationService.getNotifications(params).subscribe({
      next: (response) => {
        this.notifications = response.data;
        this.totalItems = response.totalCount;
      },
      error: () => {
        this.notifications = this.getMockNotifications();
        this.totalItems = this.notifications.length;
      }
    });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadCount = count);
  }

  subscribeToRealTime(): void {
    this.signalRService.notificationReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        this.notifications.unshift(notification);
        this.totalItems++;
      });
  }

  subscribeToConnectionState(): void {
    this.signalRService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.connectionState = signalR.HubConnectionState[state];
      });
  }

  onFilterChange(type: string): void {
    this.typeFilter = type;
    this.pageIndex = 0;
    this.loadNotifications();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNotifications();
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      notification.isRead = true;
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
      this.totalItems--;
    });
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      Info: 'info',
      Success: 'check_circle',
      Warning: 'warning',
      Error: 'error',
      Order: 'shopping_cart',
      Inventory: 'inventory_2',
      System: 'settings'
    };
    return icons[type] || 'notifications';
  }

  getTypeArabic(type: string): string {
    const types: { [key: string]: string } = {
      Info: 'معلومات',
      Success: 'نجاح',
      Warning: 'تحذير',
      Error: 'خطأ',
      Order: 'طلب',
      Inventory: 'مخزون',
      System: 'نظام'
    };
    return types[type] || type;
  }

  getConnectionStateArabic(state: string): string {
    const states: { [key: string]: string } = {
      Connected: 'متصل',
      Disconnected: 'غير متصل',
      Reconnecting: 'إعادة الاتصال'
    };
    return states[state] || state;
  }

  private getMockNotifications(): Notification[] {
    return [
      { id: 1, userId: 1, title: 'تم استلام طلب جديد', message: 'تم تقديم الطلب #ORD-2024-001 بواسطة أحمد محمد.', type: NotificationType.Order, isRead: false, createdAt: new Date() },
      { id: 2, userId: 1, title: 'تنبيه مخزون منخفض', message: 'المنتج "شاشة 27 بوصة" على وشك النفاد. الكمية الحالية: 5', type: NotificationType.Inventory, isRead: false, createdAt: new Date(Date.now() - 3600000) },
      { id: 3, userId: 1, title: 'تحديث النظام', message: 'سيخضع النظام للصيانة الليلة من الساعة 2 صباحاً حتى 4 صباحاً.', type: NotificationType.System, isRead: true, createdAt: new Date(Date.now() - 86400000) },
      { id: 4, userId: 1, title: 'تم شحن الطلب', message: 'تم شحن الطلب #ORD-2024-002 إلى العميل.', type: NotificationType.Success, isRead: true, createdAt: new Date(Date.now() - 172800000) }
    ];
  }
}
