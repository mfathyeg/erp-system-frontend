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
      <app-page-header title="Notifications" subtitle="View and manage your notifications">
        <div actions>
          <span class="connection-status" [ngClass]="connectionState">
            <mat-icon>{{ connectionState === 'Connected' ? 'wifi' : 'wifi_off' }}</mat-icon>
            {{ connectionState }}
          </span>
          <button mat-stroked-button (click)="markAllAsRead()" [disabled]="unreadCount === 0">
            <mat-icon>done_all</mat-icon>
            Mark All as Read
          </button>
        </div>
      </app-page-header>

      <div class="filters">
        <mat-chip-listbox (change)="onFilterChange($event.value)">
          <mat-chip-option value="" [selected]="typeFilter === ''">All</mat-chip-option>
          <mat-chip-option *ngFor="let type of notificationTypes" [value]="type">
            {{ type }}
          </mat-chip-option>
        </mat-chip-listbox>

        <mat-slide-toggle [(ngModel)]="showUnreadOnly" (change)="loadNotifications()">
          Show unread only
        </mat-slide-toggle>
      </div>

      <div class="notifications-list" *ngIf="notifications.length > 0">
        <mat-card *ngFor="let notification of notifications"
                  class="notification-card"
                  [class.unread]="!notification.isRead"
                  (click)="markAsRead(notification)">
          <mat-card-content>
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
                <mat-chip size="small">{{ notification.type }}</mat-chip>
                <div class="notification-actions" (click)="$event.stopPropagation()">
                  <button mat-icon-button matTooltip="Mark as read" *ngIf="!notification.isRead"
                          (click)="markAsRead(notification)">
                    <mat-icon>check</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete" color="warn"
                          (click)="deleteNotification(notification)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <app-empty-state
        *ngIf="notifications.length === 0"
        icon="notifications_none"
        title="No notifications"
        message="You're all caught up! New notifications will appear here.">
      </app-empty-state>

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
    .filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .connection-status {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      margin-right: 16px;
    }
    .connection-status mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .connection-status.Connected {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .connection-status.Disconnected,
    .connection-status.Reconnecting {
      background: #fff3e0;
      color: #e65100;
    }
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .notification-card {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .notification-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .notification-card.unread {
      border-left: 4px solid #1976d2;
      background: #f5f9ff;
    }
    .notification-card mat-card-content {
      display: flex;
      gap: 16px;
      padding: 16px !important;
    }
    .notification-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notification-icon mat-icon {
      color: white;
    }
    .icon-info { background: #2196f3; }
    .icon-success { background: #4caf50; }
    .icon-warning { background: #ff9800; }
    .icon-error { background: #f44336; }
    .icon-order { background: #9c27b0; }
    .icon-inventory { background: #00bcd4; }
    .icon-system { background: #607d8b; }
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
      font-weight: 500;
    }
    .notification-time {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      white-space: nowrap;
    }
    .notification-content p {
      margin: 0 0 12px;
      color: rgba(0, 0, 0, 0.7);
    }
    .notification-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .notification-actions {
      display: flex;
      gap: 4px;
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

  private getMockNotifications(): Notification[] {
    return [
      { id: 1, userId: 1, title: 'New Order Received', message: 'Order #ORD-2024-001 has been placed by John Doe.', type: NotificationType.Order, isRead: false, createdAt: new Date() },
      { id: 2, userId: 1, title: 'Low Stock Alert', message: 'Product "Monitor 27" is running low on stock. Current quantity: 5', type: NotificationType.Inventory, isRead: false, createdAt: new Date(Date.now() - 3600000) },
      { id: 3, userId: 1, title: 'System Update', message: 'The system will undergo maintenance tonight from 2 AM to 4 AM.', type: NotificationType.System, isRead: true, createdAt: new Date(Date.now() - 86400000) },
      { id: 4, userId: 1, title: 'Order Shipped', message: 'Order #ORD-2024-002 has been shipped to the customer.', type: NotificationType.Success, isRead: true, createdAt: new Date(Date.now() - 172800000) }
    ];
  }
}
