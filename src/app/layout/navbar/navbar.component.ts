import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
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
          <input type="text" placeholder="ابحث عن أي شيء..." class="search-input">
          <span class="search-shortcut">Ctrl+K</span>
        </div>
      </div>

      <!-- Right Section -->
      <div class="navbar-right">
        <!-- Language Selector -->
        <button class="nav-btn" [matMenuTriggerFor]="langMenu">
          <img src="https://flagcdn.com/w20/sa.png" alt="AR" class="flag-icon">
          <span class="lang-text">عربي</span>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </button>
        <mat-menu #langMenu="matMenu" class="dropdown-menu">
          <button mat-menu-item>
            <img src="https://flagcdn.com/w20/sa.png" alt="AR" class="flag-icon">
            <span>العربية</span>
          </button>
          <button mat-menu-item>
            <img src="https://flagcdn.com/w20/us.png" alt="EN" class="flag-icon">
            <span>English</span>
          </button>
          <button mat-menu-item>
            <img src="https://flagcdn.com/w20/fr.png" alt="FR" class="flag-icon">
            <span>Français</span>
          </button>
        </mat-menu>

        <!-- Theme Toggle -->
        <button class="nav-btn icon-btn theme-toggle" matTooltip="{{ isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي' }}" (click)="toggleTheme()">
          <mat-icon class="theme-icon">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- Fullscreen Toggle -->
        <button class="nav-btn icon-btn" matTooltip="ملء الشاشة" (click)="toggleFullscreen()">
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
            <h4>الإشعارات</h4>
            <button mat-button color="primary" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
              تحديد الكل كمقروء
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
              <p>لا توجد إشعارات جديدة</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="menu-footer">
            <a mat-button color="primary" routerLink="/notifications">عرض جميع الإشعارات</a>
          </div>
        </mat-menu>

        <!-- User Profile -->
        <div class="user-profile" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">
            <img src="https://ui-avatars.com/api/?name={{ currentUser?.firstName }}+{{ currentUser?.lastName }}&background=006C35&color=fff" alt="User">
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
              <img src="https://ui-avatars.com/api/?name={{ currentUser?.firstName }}+{{ currentUser?.lastName }}&background=006C35&color=fff&size=80" alt="User">
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
            <span>ملفي الشخصي</span>
          </button>
          <button mat-menu-item routerLink="/configuration">
            <mat-icon>settings</mat-icon>
            <span>الإعدادات</span>
          </button>
          <button mat-menu-item routerLink="/finance">
            <mat-icon>account_balance_wallet</mat-icon>
            <span>الفواتير</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>تسجيل الخروج</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 70px;
      background: var(--navbar-bg);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .menu-toggle:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border-color: rgba(255, 255, 255, 0.4);
    }

    .search-box {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 0 16px;
      height: 44px;
      min-width: 320px;
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.2);
    }

    .search-icon {
      color: rgba(255, 255, 255, 0.7);
      font-size: 20px;
      margin-left: 12px;
      margin-right: 0;
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-size: 14px;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .search-shortcut {
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
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
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .nav-btn.icon-btn {
      width: 40px;
      padding: 0;
      justify-content: center;
    }

    .nav-btn.theme-toggle {
      position: relative;
      overflow: hidden;
    }

    .nav-btn.theme-toggle:hover {
      border-color: #fbbf24;
      background: rgba(251, 191, 36, 0.2);
    }

    .theme-icon {
      transition: transform 0.3s ease, color 0.3s ease;
    }

    .nav-btn.theme-toggle:hover .theme-icon {
      transform: rotate(30deg);
      color: #fbbf24;
    }

    .flag-icon {
      width: 20px;
      height: 14px;
      border-radius: 2px;
    }

    .lang-text {
      font-size: 13px;
      font-weight: 500;
      color: white;
    }

    .dropdown-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(255, 255, 255, 0.7);
    }

    /* User Profile */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 6px 6px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 8px;
      margin-left: 0;
    }

    .user-profile:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      border: 2px solid rgba(255, 255, 255, 0.3);
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
      left: 2px;
      right: auto;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--navbar-bg);
    }

    .status-indicator.online {
      background: #4ade80;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    .user-role {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
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
  isDarkMode = true;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService
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

    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => this.isDarkMode = theme === 'dark');

    this.notificationService.getUnreadCount().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
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
