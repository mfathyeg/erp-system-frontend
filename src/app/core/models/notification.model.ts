export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  Info = 'Info',
  Success = 'Success',
  Warning = 'Warning',
  Error = 'Error',
  Order = 'Order',
  Inventory = 'Inventory',
  System = 'System'
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  inventoryAlerts: boolean;
  systemAlerts: boolean;
}
