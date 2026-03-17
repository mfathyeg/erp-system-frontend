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
        title="User Management"
        subtitle="Manage system users and permissions"
        [showAddButton]="true"
        addButtonText="Add User"
        (onAdd)="openUserForm()">
      </app-page-header>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="onSearch($event)" placeholder="Search users...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select (selectionChange)="onRoleFilter($event.value)">
                <mat-option value="">All Roles</mat-option>
                <mat-option value="Admin">Admin</mat-option>
                <mat-option value="Manager">Manager</mat-option>
                <mat-option value="Employee">Employee</mat-option>
                <mat-option value="Viewer">Viewer</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="onStatusFilter($event.value)">
                <mat-option value="">All</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="users" matSort (matSortChange)="onSortChange($event)">
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Username</th>
                <td mat-cell *matCellDef="let user">{{ user.username }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let user">{{ user.email }}</td>
              </ng-container>

              <ng-container matColumnDef="firstName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [ngClass]="'role-' + user.role.toLowerCase()">{{ user.role }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="isActive">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let user">
                  <span class="status-badge" [ngClass]="user.isActive ? 'active' : 'inactive'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
                <td mat-cell *matCellDef="let user">{{ user.createdAt | date:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button matTooltip="Edit" (click)="openUserForm(user)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Toggle Status" (click)="toggleUserStatus(user)">
                    <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete" color="warn" (click)="deleteUser(user)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                  No users found
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
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .filters mat-form-field {
      min-width: 200px;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-badge.active {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .status-badge.inactive {
      background: #ffebee;
      color: #c62828;
    }
    .role-admin { background-color: #e3f2fd !important; color: #1565c0 !important; }
    .role-manager { background-color: #f3e5f5 !important; color: #7b1fa2 !important; }
    .role-employee { background-color: #e8f5e9 !important; color: #2e7d32 !important; }
    .role-viewer { background-color: #fff3e0 !important; color: #ef6c00 !important; }
    .no-data {
      text-align: center;
      padding: 48px;
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
      error: () => {
        this.users = this.getMockUsers();
        this.totalItems = this.users.length;
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

  onStatusFilter(status: boolean | null): void {
    this.statusFilter = status;
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
    const action = user.isActive ? 'deactivate' : 'activate';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${user.isActive ? 'Deactivate' : 'Activate'} User`,
        message: `Are you sure you want to ${action} ${user.username}?`,
        confirmText: user.isActive ? 'Deactivate' : 'Activate',
        confirmColor: user.isActive ? 'warn' : 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.patch(`users/${user.id}/status`, { isActive: !user.isActive })
          .subscribe({
            next: () => {
              this.notificationService.showSuccess(`User ${action}d successfully`);
              this.loadUsers();
            }
          });
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.username}? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.delete(`users/${user.id}`).subscribe({
          next: () => {
            this.notificationService.showSuccess('User deleted successfully');
            this.loadUsers();
          }
        });
      }
    });
  }

  private getMockUsers(): User[] {
    return [
      { id: 1, username: 'admin', email: 'admin@erp.com', firstName: 'Admin', lastName: 'User', role: 'Admin' as any, isActive: true, createdAt: new Date() },
      { id: 2, username: 'manager1', email: 'manager@erp.com', firstName: 'John', lastName: 'Manager', role: 'Manager' as any, isActive: true, createdAt: new Date() },
      { id: 3, username: 'employee1', email: 'emp1@erp.com', firstName: 'Jane', lastName: 'Employee', role: 'Employee' as any, isActive: true, createdAt: new Date() },
      { id: 4, username: 'viewer1', email: 'viewer@erp.com', firstName: 'Bob', lastName: 'Viewer', role: 'Viewer' as any, isActive: false, createdAt: new Date() }
    ];
  }
}
