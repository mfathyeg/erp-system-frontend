export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockItems: number;
  recentOrders: RecentOrder[];
  salesByMonth: SalesData[];
  topProducts: TopProduct[];
  orderStatusDistribution: StatusCount[];
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: string;
  date: Date;
}

export interface SalesData {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
  timestamp: Date;
}
