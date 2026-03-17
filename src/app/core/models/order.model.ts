export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  status: OrderStatus;
  orderDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  totalAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Returned = 'Returned'
}

export interface CreateOrderRequest {
  customerId: number;
  shippingAddress: Address;
  billingAddress: Address;
  items: CreateOrderItemRequest[];
  notes?: string;
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
  discount?: number;
}
