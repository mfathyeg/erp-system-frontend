export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode: number;
}
