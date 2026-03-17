export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  supplier?: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface InventoryCategory {
  id: number;
  name: string;
  description?: string;
  itemCount: number;
}

export interface CreateInventoryItemRequest {
  sku: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  supplier?: string;
  location?: string;
}

export interface UpdateInventoryItemRequest extends CreateInventoryItemRequest {
  id: number;
}
