export interface Transaction {
  id: number;
  transactionNumber: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: Date;
  reference?: string;
  status: TransactionStatus;
  createdBy: number;
  createdAt: Date;
  updatedAt?: Date;
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
  Transfer = 'Transfer'
}

export enum TransactionStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  accountsReceivable: number;
  accountsPayable: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId?: number;
  customerId: number;
  customerName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}
