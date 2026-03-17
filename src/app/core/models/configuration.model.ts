export interface SystemConfiguration {
  id: number;
  key: string;
  value: string;
  category: ConfigCategory;
  description?: string;
  isEditable: boolean;
  updatedAt?: Date;
  updatedBy?: number;
}

export enum ConfigCategory {
  General = 'General',
  Email = 'Email',
  Notifications = 'Notifications',
  Security = 'Security',
  Inventory = 'Inventory',
  Orders = 'Orders',
  Finance = 'Finance'
}

export interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  taxId?: string;
  currency: string;
  timezone: string;
  dateFormat: string;
}

export interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  useSsl: boolean;
  fromEmail: string;
  fromName: string;
}
