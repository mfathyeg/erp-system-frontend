import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-navbar',
  template: `
    <mat-toolbar color="primary" class="navbar">
      <button mat-icon-button (click)="toggleMenu.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="title">ERP System</span>

      <span class="spacer"></span>

      <button mat-icon-button [matMenuTriggerFor]="notificationMenu" class="notification-btn">
        <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn">
          notifications
        </mat-icon>
      </button>
      <mat-menu #notificationMenu="matMenu" class="notification-menu">
        <div class="notification-header">
          <span>Notifications</span>
          <button mat-button color="primary" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
            Mark all as read
          </button>
        </div>
        <mat-divider></mat-divider>
        <div class="notification-list" *ngIf="notifications.length > 0">
          <button mat-menu-item *ngFor="let notification of notifications" (click)="viewNotification(notification)">
            <mat-icon [ngClass]="getNotificationIconClass(notification.type)">
              {{ getNotificationIcon(notification.type) }}
            </mat-icon>
            <div class="notification-content">
              <span class="notification-title">{{ notification.title }}</span>
              <span class="notification-time">{{ notification.createdAt | dateAgo }}</span>
            </div>
          </button>
        </div>
        <div class="empty-notifications" *ngIf="notifications.length === 0">
          <p>No notifications</p>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item routerLink="/notifications">
          <span>View all notifications</span>
        </button>
      </mat-menu>

      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <div class="user-info" *ngIf="currentUser">
          <strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>
          <span>{{ currentUser.email }}</span>
          <mat-chip-listbox>
            <mat-chip>{{ currentUser.role }}</mat-chip>
          </mat-chip-listbox>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item routerLink="/configuration/profile">
          <mat-icon>person</mat-icon>
          <span>Profile</span>
        </button>
        <button mat-menu-item routerLink="/configuration">
          <mat-icon>settings</mat-icon>
          <span>Settings</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    .title {
      margin-left: 8px;
      font-size: 18px;
      font-weight: 500;
    }
    .spacer {
      flex: 1;
    }
    .notification-btn {
      margin-right: 8px;
    }
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      font-weight: 500;
    }
    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .notification-content {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
    }
    .notification-title {
      font-size: 14px;
    }
    .notification-time {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    .empty-notifications {
      padding: 24px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
    }
    .user-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .user-info strong {
      font-size: 16px;
    }
    .user-info span {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    .icon-info { color: #1976d2; }
    .icon-success { color: #388e3c; }
    .icon-warning { color: #f57c00; }
    .icon-error { color: #d32f2f; }
    ::ng-deep .notification-menu {
      min-width: 320px !important;
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleMenu = new EventEmitter<void>();

  currentUser: User | null = null;
  unreadCount = 0;
  notifications: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.currentUser = user);

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadCount = count);

    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => this.notifications = notifications.slice(0, 5));

    this.notificationService.getUnreadCount().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  viewNotification(notification: any): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
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

  getNotificationIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      Info: 'icon-info',
      Success: 'icon-success',
      Warning: 'icon-warning',
      Error: 'icon-error'
    };
    return classes[type] || 'icon-info';
  }
}
