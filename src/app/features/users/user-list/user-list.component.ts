import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, PaginatedResponse, PaginationParams } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list-container">
      <app-page-header
        title="إدارة المستخدمين"
        subtitle="إدارة مستخدمي النظام والصلاحيات"
        [breadcrumb]="['لوحة التحكم', 'المستخدمين']"
        [showAddButton]="true"
        addButtonText="إضافة مستخدم"
        (onAdd)="openUserForm()">
      </app-page-header>

      <div class="content-card">
        <div class="card-toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" (keyup)="onSearch($event)" placeholder="البحث عن المستخدمين...">
          </div>

          <div class="filters">
            <div class="filter-group">
              <label>الدور</label>
              <select (change)="onRoleFilter($any($event.target).value)">
                <option value="">جميع الأدوار</option>
                <option value="Admin">مدير</option>
                <option value="Manager">مشرف</option>
                <option value="Employee">موظف</option>
                <option value="Viewer">مشاهد</option>
              </select>
            </div>

            <div class="filter-group">
              <label>الحالة</label>
              <select (change)="onStatusFilter($any($event.target).value)">
                <option value="">الكل</option>
                <option value="true">نشط</option>
                <option value="false">غير نشط</option>
              </select>
            </div>
          </div>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="users" matSort (matSortChange)="onSortChange($event)">
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>اسم المستخدم</th>
              <td mat-cell *matCellDef="let user">
                <div class="user-cell">
                  <div class="user-avatar">{{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}</div>
                  <span>{{ user.username }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>البريد الإلكتروني</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="firstName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>الاسم</th>
              <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>الدور</th>
              <td mat-cell *matCellDef="let user">
                <span class="role-badge" [ngClass]="'role-' + user.role.toLowerCase()">{{ getRoleArabic(user.role) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>الحالة</th>
              <td mat-cell *matCellDef="let user">
                <span class="status-badge" [ngClass]="user.isActive ? 'active' : 'inactive'">
                  <span class="status-dot"></span>
                  {{ user.isActive ? 'نشط' : 'غير نشط' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>تاريخ الإنشاء</th>
              <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>الإجراءات</th>
              <td mat-cell *matCellDef="let user">
                <div class="action-buttons">
                  <button class="action-btn" matTooltip="تعديل" (click)="openUserForm(user)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="action-btn" matTooltip="تغيير الحالة" (click)="toggleUserStatus(user)">
                    <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                  <button class="action-btn danger" matTooltip="حذف" (click)="deleteUser(user)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>people_outline</mat-icon>
                  <span>لا يوجد مستخدمين</span>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          [pageIndex]="pageIndex"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .content-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }

    .card-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 16px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px 16px;
      min-width: 280px;
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .search-box mat-icon {
      color: var(--text-muted);
    }

    .search-box input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 14px;
    }

    .search-box input::placeholder {
      color: var(--text-muted);
    }

    .filters {
      display: flex;
      gap: 16px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-group label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-group select {
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text-primary);
      font-size: 14px;
      min-width: 140px;
      cursor: pointer;
    }

    .filter-group select:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .role-badge {
      display: inline-flex;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .role-admin {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .role-manager {
      background: rgba(139, 92, 246, 0.15);
      color: var(--accent-color);
    }

    .role-employee {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .role-viewer {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.active {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .status-badge.inactive {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .action-buttons {
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: var(--text-muted);
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .no-data {
      text-align: center;
    }

    @media (max-width: 768px) {
      .card-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        min-width: 100%;
      }

      .filters {
        flex-wrap: wrap;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [];
  displayedColumns = ['username', 'email', 'firstName', 'role', 'isActive', 'createdAt', 'actions'];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  roleFilter = '';
  statusFilter: boolean | null = null;
  sortBy = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params: PaginationParams = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm
    };

    this.apiService.getPaginated<User>('users', params).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalItems = response.totalCount;
      },
      error: (error) => {
        this.notificationService.showError('فشل في تحميل المستخدمين');
        this.users = [];
        this.totalItems = 0;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.pageIndex = 0;
    this.loadUsers();
  }

  onRoleFilter(role: string): void {
    this.roleFilter = role;
    this.pageIndex = 0;
    this.loadUsers();
  }

  onStatusFilter(status: string): void {
    this.statusFilter = status === '' ? null : status === 'true';
    this.pageIndex = 0;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc' || 'asc';
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  openUserForm(user?: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'تعطيل' : 'تفعيل';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${action} المستخدم`,
        message: `هل أنت متأكد من ${action} ${user.username}؟`,
        confirmText: action,
        type: user.isActive ? 'warning' : 'success'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.patch(`users/${user.id}/status`, { isActive: !user.isActive })
          .subscribe({
            next: () => {
              this.notificationService.showSuccess(`تم ${action} المستخدم بنجاح`);
              this.loadUsers();
            }
          });
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'حذف المستخدم',
        message: `هل أنت متأكد من حذف ${user.username}؟ لا يمكن التراجع عن هذا الإجراء.`,
        confirmText: 'حذف',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.delete(`users/${user.id}`).subscribe({
          next: () => {
            this.notificationService.showSuccess('تم حذف المستخدم بنجاح');
            this.loadUsers();
          }
        });
      }
    });
  }

  getRoleArabic(role: string): string {
    const roles: { [key: string]: string } = {
      Admin: 'مدير',
      Manager: 'مشرف',
      Employee: 'موظف',
      Viewer: 'مشاهد'
    };
    return roles[role] || role;
  }
}
