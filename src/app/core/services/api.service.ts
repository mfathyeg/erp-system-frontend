import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse, PaginationParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  getPaginated<T>(endpoint: string, params: PaginationParams): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Observable<T> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData);
  }
}
