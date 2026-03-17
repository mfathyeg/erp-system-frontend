import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, Notification } from '../../core/models';

@Component({
  selector: 'app-navbar',
  template: `
    <header class="navbar">
      <!-- Left Section -->
      <div class="navbar-left">
        <button class="menu-toggle" (click)="toggleMenu.emit()">
          <mat-icon>menu</mat-icon>
        </button>

        <div class="search-box">
          <mat-icon class="search-icon">search</mat-icon>
          <input type="text" placeholder="Search anything..." class="search-input">
          <span class="search-shortcut">Ctrl+K</span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="navbar-right">
        <!-- Language Selector -->
        <button class="nav-btn" [matMenuTriggerFor]="langMenu">
          <img src="https://flagcdn.com/w20/us.png" alt="EN" class="flag-icon">
          <span class="lang-text">EN</span>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </button>
        <mat-menu #langMenu="matMenu" class="dropdown-menu">
          <button mat-menu-item>
            <img src="https://flagcdn.com/w20/us.png" alt="EN" class="flag-icon">
            <span>English</span>
          </button>
          <button mat-menu-item>
            <img src="https://flagcdn.com/w20/es.png" alt="ES" class="flag-icon">
            <span>Spanish</span>
          </button>
          <button mat-menu-item>
            <img src="https://flagcdn.com/w20/fr.png" alt="FR" class="flag-icon">
            <span>French</span>
          </button>
          <button mat-menu-item>
            <img src="https://flagcdn.com/w20/de.png" alt="DE" class="flag-icon">
            <span>German</span>
          </button>
        </mat-menu>

        <!-- Theme Toggle -->
        <button class="nav-btn icon-btn" matTooltip="Toggle Theme">
          <mat-icon>dark_mode</mat-icon>
        </button>

        <!-- Fullscreen Toggle -->
        <button class="nav-btn icon-btn" matTooltip="Fullscreen" (click)="toggleFullscreen()">
          <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
        </button>

        <!-- Notifications -->
        <button class="nav-btn icon-btn" [matMenuTriggerFor]="notifMenu">
          <mat-icon [matBadge]="unreadCount" [matBadgeHidden]="unreadCount === 0" matBadgeColor="warn" matBadgeSize="small">
            notifications
          </mat-icon>
        </button>
        <mat-menu #notifMenu="matMenu" class="notification-menu">
          <div class="menu-header">
            <h4>Notifications</h4>
            <button mat-button color="primary" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
              Mark all read
            </button>
          </div>
          <mat-divider></mat-divider>
          <div class="notification-list">
            <div class="notification-item" *ngFor="let notif of notifications" [class.unread]="!notif.isRead">
              <div class="notif-icon" [ngClass]="'icon-' + notif.type.toLowerCase()">
                <mat-icon>{{ getNotificationIcon(notif.type) }}</mat-icon>
              </div>
              <div class="notif-content">
                <p class="notif-title">{{ notif.title }}</p>
                <span class="notif-time">{{ notif.createdAt | dateAgo }}</span>
              </div>
            </div>
            <div class="empty-notifications" *ngIf="notifications.length === 0">
              <mat-icon>notifications_none</mat-icon>
              <p>No new notifications</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="menu-footer">
            <a mat-button color="primary" routerLink="/notifications">View All Notifications</a>
          </div>
        </mat-menu>

        <!-- User Profile -->
        <div class="user-profile" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">
            <img src="https://ui-avatars.com/api/?name={{ currentUser?.firstName }}+{{ currentUser?.lastName }}&background=6366f1&color=fff" alt="User">
            <span class="status-indicator online"></span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
            <span class="user-role">{{ currentUser?.role }}</span>
          </div>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </div>
        <mat-menu #userMenu="matMenu" class="user-menu">
          <div class="user-menu-header">
            <div class="user-avatar large">
              <img src="https://ui-avatars.com/api/?name={{ currentUser?.firstName }}+{{ currentUser?.lastName }}&background=6366f1&color=fff&size=80" alt="User">
            </div>
            <div class="user-details">
              <h4>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h4>
              <p>{{ currentUser?.email }}</p>
              <span class="badge badge-primary">{{ currentUser?.role }}</span>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/configuration">
            <mat-icon>person</mat-icon>
            <span>My Profile</span>
          </button>
          <button mat-menu-item routerLink="/configuration">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <button mat-menu-item routerLink="/finance">
            <mat-icon>account_balance_wallet</mat-icon>
            <span>Billing</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 70px;
      background: var(--navbar-bg);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    /* Left Section */
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .menu-toggle {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .menu-toggle:hover {
      background: var(--card-bg);
      color: var(--text-primary);
      border-color: var(--primary-color);
    }

    .search-box {
      display: flex;
      align-items: center;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0 16px;
      height: 44px;
      min-width: 320px;
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .search-icon {
      color: var(--text-muted);
      font-size: 20px;
      margin-right: 12px;
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 14px;
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-shortcut {
      padding: 4px 8px;
      background: var(--secondary-bg);
      border-radius: 6px;
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Right Section */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-btn {
      height: 40px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      background: var(--card-bg);
      color: var(--text-primary);
    }

    .nav-btn.icon-btn {
      width: 40px;
      padding: 0;
      justify-content: center;
    }

    .flag-icon {
      width: 20px;
      height: 14px;
      border-radius: 2px;
    }

    .lang-text {
      font-size: 13px;
      font-weight: 500;
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-muted);
    }

    /* User Profile */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 12px 6px 6px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: 8px;
    }

    .user-profile:hover {
      background: var(--card-bg);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-avatar.large {
      width: 60px;
      height: 60px;
      border-radius: 14px;
    }

    .status-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--navbar-bg);
    }

    .status-indicator.online {
      background: var(--success-color);
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-role {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Notification Menu */
    ::ng-deep .notification-menu {
      width: 360px !important;
      max-width: 360px !important;
    }

    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .menu-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .notification-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .notification-item:hover {
      background: var(--card-bg-hover);
    }

    .notification-item.unread {
      background: rgba(99, 102, 241, 0.05);
    }

    .notif-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notif-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: white;
    }

    .notif-icon.icon-info { background: var(--gradient-info); }
    .notif-icon.icon-success { background: var(--gradient-success); }
    .notif-icon.icon-warning { background: var(--gradient-warning); }
    .notif-icon.icon-error { background: var(--gradient-danger); }
    .notif-icon.icon-order { background: var(--gradient-purple); }
    .notif-icon.icon-inventory { background: var(--gradient-cyan); }
    .notif-icon.icon-system { background: var(--gradient-primary); }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-title {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notif-time {
      font-size: 12px;
      color: var(--text-muted);
    }

    .empty-notifications {
      padding: 32px;
      text-align: center;
      color: var(--text-muted);
    }

    .empty-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .menu-footer {
      padding: 12px 16px;
      text-align: center;
    }

    /* User Menu */
    ::ng-deep .user-menu {
      width: 280px !important;
    }

    .user-menu-header {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-details h4 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-details p {
      margin: 0 0 8px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .logout-btn {
      color: var(--danger-color) !important;
    }

    @media (max-width: 768px) {
      .search-box {
        display: none;
      }

      .user-info {
        display: none;
      }

      .lang-text {
        display: none;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleMenu = new EventEmitter<void>();

  currentUser: User | null = null;
  unreadCount = 0;
  notifications: Notification[] = [];
  isFullscreen = false;

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

    // Set mock user for demo
    if (!this.currentUser) {
      this.currentUser = {
        id: 1,
        username: 'admin',
        email: 'admin@duralux.com',
        firstName: 'John',
        lastName: 'Anderson',
        role: 'Admin' as any,
        isActive: true,
        createdAt: new Date()
      };
    }

    // Set mock notifications for demo
    if (this.notifications.length === 0) {
      this.notifications = [
        { id: 1, userId: 1, title: 'New order received #ORD-2024-001', message: '', type: 'Order' as any, isRead: false, createdAt: new Date() },
        { id: 2, userId: 1, title: 'Low stock alert: Monitor 27"', message: '', type: 'Warning' as any, isRead: false, createdAt: new Date(Date.now() - 3600000) },
        { id: 3, userId: 1, title: 'Payment received $1,250.00', message: '', type: 'Success' as any, isRead: true, createdAt: new Date(Date.now() - 7200000) }
      ];
      this.unreadCount = 2;
    }
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

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
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
}
