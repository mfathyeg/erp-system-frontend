import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar" [class.collapsed]="collapsed">
      <div class="logo-container">
        <img src="assets/logo.png" alt="ERP Logo" class="logo" *ngIf="!collapsed">
        <img src="assets/logo-icon.png" alt="ERP" class="logo-icon" *ngIf="collapsed">
      </div>

      <mat-nav-list>
        <ng-container *ngFor="let item of navItems">
          <ng-container *ngIf="hasAccess(item.roles)">
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
               (click)="onNavClick()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle *ngIf="!collapsed">{{ item.label }}</span>
            </a>
          </ng-container>
        </ng-container>
      </mat-nav-list>

      <div class="sidebar-footer">
        <button mat-icon-button (click)="toggleSidebar.emit()" class="toggle-btn">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      height: 100%;
      width: 260px;
      background: #1a237e;
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
    }
    .sidebar.collapsed {
      width: 64px;
    }
    .logo-container {
      padding: 16px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      min-height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo {
      max-width: 180px;
      max-height: 40px;
    }
    .logo-icon {
      max-width: 32px;
      max-height: 32px;
    }
    mat-nav-list {
      flex: 1;
      padding-top: 8px;
    }
    .mat-mdc-list-item {
      color: rgba(255, 255, 255, 0.7);
      margin: 4px 8px;
      border-radius: 4px;
    }
    .mat-mdc-list-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .mat-mdc-list-item.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    ::ng-deep .mat-mdc-list-item-icon {
      color: inherit !important;
    }
    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      justify-content: center;
    }
    .toggle-btn {
      color: rgba(255, 255, 255, 0.7);
    }
    .collapsed mat-nav-list .mat-mdc-list-item {
      justify-content: center;
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

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Inventory', icon: 'inventory_2', route: '/inventory' },
    { label: 'Orders', icon: 'shopping_cart', route: '/orders' },
    { label: 'Users', icon: 'people', route: '/users', roles: [UserRole.Admin, UserRole.Manager] },
    { label: 'Finance', icon: 'account_balance', route: '/finance', roles: [UserRole.Admin, UserRole.Manager] },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' },
    { label: 'Configuration', icon: 'settings', route: '/configuration', roles: [UserRole.Admin] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  hasAccess(roles?: UserRole[]): boolean {
    if (!roles || roles.length === 0) return true;
    return this.authService.hasRole(roles);
  }

  onNavClick(): void {
    this.navItemClicked.emit();
  }
}
