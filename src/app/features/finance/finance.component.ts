import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ApiService } from '../../core/services/api.service';
import { Transaction, TransactionType, TransactionStatus, FinancialSummary, PaginationParams } from '../../core/models';

@Component({
  selector: 'app-finance',
  template: `
    <div class="finance-container">
      <app-page-header title="Finance" subtitle="Financial overview and transactions"></app-page-header>

      <div class="summary-cards">
        <mat-card class="summary-card income">
          <mat-card-content>
            <mat-icon>trending_up</mat-icon>
            <div class="summary-info">
              <span class="amount">{{ summary?.totalIncome | currencyFormat }}</span>
              <span class="label">Total Income</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card expense">
          <mat-card-content>
            <mat-icon>trending_down</mat-icon>
            <div class="summary-info">
              <span class="amount">{{ summary?.totalExpenses | currencyFormat }}</span>
              <span class="label">Total Expenses</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card profit">
          <mat-card-content>
            <mat-icon>account_balance</mat-icon>
            <div class="summary-info">
              <span class="amount">{{ summary?.netProfit | currencyFormat }}</span>
              <span class="label">Net Profit</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card pending">
          <mat-card-content>
            <mat-icon>pending_actions</mat-icon>
            <div class="summary-info">
              <span class="amount">{{ summary?.pendingPayments | currencyFormat }}</span>
              <span class="label">Pending Payments</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Transactions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput (keyup)="onSearch($event)" placeholder="Search transactions...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select (selectionChange)="onTypeFilter($event.value)">
                <mat-option value="">All Types</mat-option>
                <mat-option *ngFor="let type of transactionTypes" [value]="type">{{ type }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="onStatusFilter($event.value)">
                <mat-option value="">All Statuses</mat-option>
                <mat-option *ngFor="let status of transactionStatuses" [value]="status">{{ status }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="transactions" matSort (matSortChange)="onSortChange($event)">
              <ng-container matColumnDef="transactionNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Transaction #</th>
                <td mat-cell *matCellDef="let t">{{ t.transactionNumber }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let t">{{ t.date | date:'short' }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let t">
                  <span class="type-badge" [ngClass]="'type-' + t.type.toLowerCase()">
                    <mat-icon>{{ getTypeIcon(t.type) }}</mat-icon>
                    {{ t.type }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let t">{{ t.category }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let t">{{ t.description | truncate:40 }}</td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
                <td mat-cell *matCellDef="let t" [ngClass]="getAmountClass(t.type)">
                  {{ t.type === 'Expense' ? '-' : '+' }}{{ t.amount | currencyFormat }}
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let t">
                  <span class="status-badge" [ngClass]="'status-' + t.status.toLowerCase()">
                    {{ t.status }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                  No transactions found
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
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px !important;
    }
    .summary-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    .summary-card.income mat-icon { color: #4caf50; }
    .summary-card.expense mat-icon { color: #f44336; }
    .summary-card.profit mat-icon { color: #2196f3; }
    .summary-card.pending mat-icon { color: #ff9800; }
    .summary-info {
      display: flex;
      flex-direction: column;
    }
    .summary-info .amount {
      font-size: 24px;
      font-weight: 600;
    }
    .summary-info .label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
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
    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .type-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .type-income { background: #e8f5e9; color: #2e7d32; }
    .type-expense { background: #ffebee; color: #c62828; }
    .type-transfer { background: #e3f2fd; color: #1565c0; }
    .amount-income { color: #2e7d32; font-weight: 500; }
    .amount-expense { color: #c62828; font-weight: 500; }
    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #ffebee; color: #c62828; }
    .no-data {
      text-align: center;
      padding: 48px;
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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadTransactions();
  }

  loadSummary(): void {
    this.apiService.get<FinancialSummary>('finance/summary').subscribe({
      next: (summary) => this.summary = summary,
      error: () => this.summary = this.getMockSummary()
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
        this.transactions = this.getMockTransactions();
        this.totalItems = this.transactions.length;
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

  private getMockSummary(): FinancialSummary {
    return {
      totalIncome: 125000,
      totalExpenses: 78000,
      netProfit: 47000,
      pendingPayments: 12500,
      accountsReceivable: 35000,
      accountsPayable: 22000
    };
  }

  private getMockTransactions(): Transaction[] {
    return [
      { id: 1, transactionNumber: 'TXN-001', type: TransactionType.Income, category: 'Sales', amount: 5000, description: 'Product sales revenue', date: new Date(), status: TransactionStatus.Completed, createdBy: 1, createdAt: new Date() },
      { id: 2, transactionNumber: 'TXN-002', type: TransactionType.Expense, category: 'Office Supplies', amount: 250, description: 'Office supplies purchase', date: new Date(), status: TransactionStatus.Completed, createdBy: 1, createdAt: new Date() },
      { id: 3, transactionNumber: 'TXN-003', type: TransactionType.Income, category: 'Services', amount: 3500, description: 'Consulting services', date: new Date(), status: TransactionStatus.Pending, createdBy: 1, createdAt: new Date() },
      { id: 4, transactionNumber: 'TXN-004', type: TransactionType.Expense, category: 'Utilities', amount: 850, description: 'Monthly utilities bill', date: new Date(), status: TransactionStatus.Completed, createdBy: 1, createdAt: new Date() }
    ];
  }
}
