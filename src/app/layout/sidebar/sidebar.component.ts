import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  roles?: UserRole[];
  children?: NavItem[];
  expanded?: boolean;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo" *ngIf="!collapsed">
          <div class="logo-icon">
            <span>D</span>
          </div>
          <div class="logo-text">
            <span class="brand">ERP</span>
            <span class="tagline">نظام إدارة الموارد</span>
          </div>
        </div>
        <div class="logo-collapsed" *ngIf="collapsed">
          <div class="logo-icon small">
            <span>D</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="nav-container">
        <div class="nav-group" *ngFor="let group of navGroups">
          <div class="nav-group-title" *ngIf="!collapsed">{{ group.title }}</div>

          <ng-container *ngFor="let item of group.items">
            <ng-container *ngIf="hasAccess(item.roles)">
              <!-- Simple nav item -->
              <a *ngIf="!item.children"
                 class="nav-item"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
                 (click)="onNavClick()"
                 [matTooltip]="collapsed ? item.label : ''"
                 matTooltipPosition="left">
                <div class="nav-icon">
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                <span class="nav-badge" *ngIf="item.badge && !collapsed" [class]="item.badgeColor">
                  {{ item.badge }}
                </span>
              </a>

              <!-- Nav item with children -->
              <div *ngIf="item.children" class="nav-item-group">
                <a class="nav-item"
                   [class.expanded]="item.expanded"
                   (click)="toggleExpand(item)"
                   [matTooltip]="collapsed ? item.label : ''"
                   matTooltipPosition="left">
                  <div class="nav-icon">
                    <mat-icon>{{ item.icon }}</mat-icon>
                  </div>
                  <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                  <mat-icon class="expand-icon" *ngIf="!collapsed">
                    {{ item.expanded ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </a>
                <div class="nav-children" *ngIf="item.expanded && !collapsed">
                  <a *ngFor="let child of item.children"
                     class="nav-child"
                     [routerLink]="child.route"
                     routerLinkActive="active"
                     (click)="onNavClick()">
                    <span class="child-dot"></span>
                    <span>{{ child.label }}</span>
                  </a>
                </div>
              </div>
            </ng-container>
          </ng-container>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <button class="collapse-btn" (click)="toggleSidebar.emit()">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100%;
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 1px solid var(--border-color);
      border-right: none;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    /* Logo Section */
    .logo-section {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      background: var(--gradient-primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .logo-icon.small {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }

    .logo-collapsed {
      display: flex;
      justify-content: center;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .brand {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .tagline {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Navigation */
    .nav-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 12px;
    }

    .nav-group {
      margin-bottom: 24px;
    }

    .nav-group-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding: 0 12px;
      margin-bottom: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px;
      margin: 4px 0;
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      position: relative;
    }

    .nav-item:hover {
      background: var(--card-bg-hover);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--gradient-primary);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .nav-item.active .nav-icon mat-icon {
      color: white;
    }

    .nav-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: var(--secondary-bg);
      margin-left: 12px;
      margin-right: 0;
      flex-shrink: 0;
    }

    .nav-item.active .nav-icon {
      background: rgba(255, 255, 255, 0.25);
    }

    .nav-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-secondary);
      transition: color 0.2s ease;
    }

    .nav-item:hover .nav-icon mat-icon {
      color: var(--primary-light);
    }

    .nav-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
    }

    .nav-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      background: var(--danger-color);
      color: white;
    }

    .nav-badge.success { background: var(--success-color); }
    .nav-badge.warning { background: var(--warning-color); }
    .nav-badge.info { background: var(--info-color); }

    .expand-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      transition: transform 0.2s ease;
    }

    .nav-children {
      padding-right: 60px;
      padding-left: 0;
      margin-top: 4px;
    }

    .nav-child {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 8px;
      text-decoration: none;
    }

    .nav-child:hover {
      color: var(--text-primary);
      background: var(--card-bg-hover);
    }

    .nav-child.active {
      color: var(--primary-light);
    }

    .child-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      transition: all 0.2s ease;
    }

    .nav-child:hover .child-dot,
    .nav-child.active .child-dot {
      background: var(--primary-color);
      box-shadow: 0 0 8px var(--primary-color);
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: center;
    }

    .collapse-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .collapse-btn:hover {
      background: var(--card-bg-hover);
      color: var(--text-primary);
      border-color: var(--primary-color);
    }

    /* Collapsed State */
    .sidebar.collapsed .nav-icon {
      margin-left: 0;
      margin-right: 0;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 12px;
    }

    .sidebar.collapsed .nav-group-title {
      display: none;
    }

    /* Scrollbar */
    .nav-container::-webkit-scrollbar {
      width: 4px;
    }

    .nav-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .nav-container::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 2px;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
      }
      .sidebar.collapsed {
        width: 100%;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() navItemClicked = new EventEmitter<void>();

  navGroups: NavGroup[] = [
    {
      title: 'القائمة الرئيسية',
      items: [
        { label: 'لوحة التحكم', icon: 'dashboard', route: '/dashboard' },
        { label: 'التحليلات', icon: 'analytics', route: '/dashboard', badge: 3, badgeColor: 'info' }
      ]
    },
    {
      title: 'الإدارة',
      items: [
        { label: 'المخزون', icon: 'inventory_2', route: '/inventory' },
        {
          label: 'الطلبات',
          icon: 'shopping_cart',
          route: '/orders',
          badge: 12,
          badgeColor: 'warning'
        },
        { label: 'المستخدمين', icon: 'people', route: '/users', roles: [UserRole.Admin, UserRole.Manager] },
        { label: 'المالية', icon: 'account_balance_wallet', route: '/finance', roles: [UserRole.Admin, UserRole.Manager] }
      ]
    },
    {
      title: 'أخرى',
      items: [
        { label: 'الإشعارات', icon: 'notifications', route: '/notifications', badge: 5 },
        { label: 'الإعدادات', icon: 'settings', route: '/configuration', roles: [UserRole.Admin] }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  hasAccess(roles?: UserRole[]): boolean {
    if (!roles || roles.length === 0) return true;
    return this.authService.hasRole(roles);
  }

  toggleExpand(item: NavItem): void {
    item.expanded = !item.expanded;
  }

  onNavClick(): void {
    this.navItemClicked.emit();
  }
}
