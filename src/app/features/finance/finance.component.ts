import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Transaction, TransactionType, TransactionStatus, FinancialSummary, PaginationParams } from '../../core/models';

@Component({
  selector: 'app-finance',
  template: `
    <div class="finance-container">
      <app-page-header
        title="المالية"
        subtitle="نظرة عامة مالية والمعاملات"
        [breadcrumb]="['لوحة التحكم', 'المالية']">
      </app-page-header>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon income">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-amount">{{ summary?.totalIncome | currencyFormat }}</span>
            <span class="card-label">إجمالي الدخل</span>
            <span class="card-trend positive">
              <mat-icon>arrow_upward</mat-icon>
              +12.5%
            </span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon expense">
            <mat-icon>trending_down</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-amount">{{ summary?.totalExpenses | currencyFormat }}</span>
            <span class="card-label">إجمالي المصروفات</span>
            <span class="card-trend negative">
              <mat-icon>arrow_upward</mat-icon>
              +8.2%
            </span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon profit">
            <mat-icon>account_balance</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-amount">{{ summary?.netProfit | currencyFormat }}</span>
            <span class="card-label">صافي الربح</span>
            <span class="card-trend positive">
              <mat-icon>arrow_upward</mat-icon>
              +18.3%
            </span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon pending">
            <mat-icon>pending_actions</mat-icon>
          </div>
          <div class="card-info">
            <span class="card-amount">{{ summary?.pendingPayments | currencyFormat }}</span>
            <span class="card-label">مدفوعات معلقة</span>
            <span class="card-trend neutral">
              <mat-icon>remove</mat-icon>
              3 فواتير
            </span>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="content-card">
        <div class="card-header">
          <h3>المعاملات الأخيرة</h3>
          <button class="btn-export">
            <mat-icon>download</mat-icon>
            تصدير
          </button>
        </div>

        <div class="card-toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" (keyup)="onSearch($event)" placeholder="البحث عن المعاملات...">
          </div>

          <div class="filters">
            <select (change)="onTypeFilter($any($event.target).value)">
              <option value="">جميع الأنواع</option>
              <option *ngFor="let type of transactionTypes" [value]="type">{{ getTypeArabic(type) }}</option>
            </select>

            <select (change)="onStatusFilter($any($event.target).value)">
              <option value="">جميع الحالات</option>
              <option *ngFor="let status of transactionStatuses" [value]="status">{{ getStatusArabic(status) }}</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="transactions" matSort (matSortChange)="onSortChange($event)">
            <ng-container matColumnDef="transactionNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>رقم المعاملة</th>
              <td mat-cell *matCellDef="let t">
                <span class="txn-number">{{ t.transactionNumber }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>التاريخ</th>
              <td mat-cell *matCellDef="let t">{{ t.date | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>النوع</th>
              <td mat-cell *matCellDef="let t">
                <span class="type-badge" [ngClass]="'type-' + t.type.toLowerCase()">
                  <mat-icon>{{ getTypeIcon(t.type) }}</mat-icon>
                  {{ getTypeArabic(t.type) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>الفئة</th>
              <td mat-cell *matCellDef="let t">{{ getCategoryArabic(t.category) }}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>الوصف</th>
              <td mat-cell *matCellDef="let t">{{ t.description | truncate:40 }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>المبلغ</th>
              <td mat-cell *matCellDef="let t" [ngClass]="getAmountClass(t.type)">
                {{ t.type === 'Expense' ? '-' : '+' }}{{ t.amount | currencyFormat }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>الحالة</th>
              <td mat-cell *matCellDef="let t">
                <span class="status-badge" [ngClass]="'status-' + t.status.toLowerCase()">
                  <span class="status-dot"></span>
                  {{ getStatusArabic(t.status) }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>receipt_long</mat-icon>
                  <span>لا توجد معاملات</span>
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
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      gap: 16px;
    }

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .card-icon.income {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .card-icon.expense {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .card-icon.profit {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .card-icon.pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .card-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-amount {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .card-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .card-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .card-trend mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .card-trend.positive {
      color: var(--success-color);
    }

    .card-trend.negative {
      color: var(--danger-color);
    }

    .card-trend.neutral {
      color: var(--text-muted);
    }

    .content-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .card-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .btn-export {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-export:hover {
      background: var(--card-bg-hover);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .btn-export mat-icon {
      font-size: 18px;
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
    }

    .search-box:focus-within {
      border-color: var(--primary-color);
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

    .filters {
      display: flex;
      gap: 12px;
    }

    .filters select {
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 14px;
      min-width: 140px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .txn-number {
      font-family: monospace;
      font-size: 13px;
      color: var(--text-secondary);
      background: var(--secondary-bg);
      padding: 4px 8px;
      border-radius: 6px;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .type-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .type-income {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .type-expense {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .type-transfer {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .amount-income {
      color: var(--success-color);
      font-weight: 600;
    }

    .amount-expense {
      color: var(--danger-color);
      font-weight: 600;
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

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .status-completed {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .status-cancelled {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
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

    @media (max-width: 1200px) {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }

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
export class FinanceComponent implements OnInit {
  transactions: Transaction[] = [];
  summary: FinancialSummary | null = null;
  displayedColumns = ['transactionNumber', 'date', 'type', 'category', 'description', 'amount', 'status'];
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  sortBy = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  transactionTypes = Object.values(TransactionType);
  transactionStatuses = Object.values(TransactionStatus);

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTransactions();
  }

  loadSummary(): void {
    this.apiService.get<FinancialSummary>('finance/summary').subscribe({
      next: (summary) => this.summary = summary,
      error: () => {
        this.notificationService.showError('فشل في تحميل الملخص المالي');
        this.summary = null;
      }
    });
  }

  loadTransactions(): void {
    const params: PaginationParams = {
      pageNumber: this.pageIndex + 1,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      searchTerm: this.searchTerm
    };

    this.apiService.getPaginated<Transaction>('finance/transactions', params).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.totalItems = response.totalCount;
      },
      error: () => {
        this.notificationService.showError('فشل في تحميل المعاملات');
        this.transactions = [];
        this.totalItems = 0;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.pageIndex = 0;
    this.loadTransactions();
  }

  onTypeFilter(type: string): void {
    this.typeFilter = type;
    this.pageIndex = 0;
    this.loadTransactions();
  }

  onStatusFilter(status: string): void {
    this.statusFilter = status;
    this.pageIndex = 0;
    this.loadTransactions();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc' || 'desc';
    this.loadTransactions();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Income': return 'arrow_downward';
      case 'Expense': return 'arrow_upward';
      case 'Transfer': return 'swap_horiz';
      default: return 'receipt';
    }
  }

  getAmountClass(type: string): string {
    return type === 'Expense' ? 'amount-expense' : 'amount-income';
  }

  getTypeArabic(type: string): string {
    const types: { [key: string]: string } = {
      Income: 'دخل',
      Expense: 'مصروف',
      Transfer: 'تحويل'
    };
    return types[type] || type;
  }

  getStatusArabic(status: string): string {
    const statuses: { [key: string]: string } = {
      Pending: 'قيد الانتظار',
      Completed: 'مكتمل',
      Cancelled: 'ملغي'
    };
    return statuses[status] || status;
  }

  getCategoryArabic(category: string): string {
    const categories: { [key: string]: string } = {
      Sales: 'مبيعات',
      Services: 'خدمات',
      'Office Supplies': 'مستلزمات مكتبية',
      Utilities: 'مرافق',
      Rent: 'إيجار',
      Salaries: 'رواتب'
    };
    return categories[category] || category;
  }
}
