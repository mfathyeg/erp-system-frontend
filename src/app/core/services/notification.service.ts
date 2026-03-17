import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { SignalRService } from './signalr.service';
import { Notification, PaginatedResponse, PaginationParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private signalRService: SignalRService,
    private snackBar: MatSnackBar
  ) {
    this.subscribeToRealTimeNotifications();
  }

  private subscribeToRealTimeNotifications(): void {
    this.signalRService.notificationReceived$.subscribe(notification => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      this.showToast(notification.title, notification.type);
    });
  }

  getNotifications(params: PaginationParams): Observable<PaginatedResponse<Notification>> {
    return this.apiService.getPaginated<Notification>('notifications', params);
  }

  getUnreadCount(): Observable<number> {
    return this.apiService.get<number>('notifications/unread-count')
      .pipe(tap(count => this.unreadCountSubject.next(count)));
  }

  markAsRead(id: number): Observable<void> {
    return this.apiService.put<void>(`notifications/${id}/read`, {})
      .pipe(
        tap(() => {
          const current = this.notificationsSubject.value;
          const updated = current.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          );
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        })
      );
  }

  markAllAsRead(): Observable<void> {
    return this.apiService.put<void>('notifications/mark-all-read', {})
      .pipe(
        tap(() => {
          const current = this.notificationsSubject.value;
          const updated = current.map(n => ({ ...n, isRead: true }));
          this.notificationsSubject.next(updated);
          this.unreadCountSubject.next(0);
        })
      );
  }

  deleteNotification(id: number): Observable<void> {
    return this.apiService.delete<void>(`notifications/${id}`)
      .pipe(
        tap(() => {
          const current = this.notificationsSubject.value;
          const notification = current.find(n => n.id === id);
          const updated = current.filter(n => n.id !== id);
          this.notificationsSubject.next(updated);
          if (notification && !notification.isRead) {
            this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
          }
        })
      );
  }

  showSuccess(message: string): void {
    this.showToast(message, 'Success');
  }

  showError(message: string): void {
    this.showToast(message, 'Error');
  }

  showWarning(message: string): void {
    this.showToast(message, 'Warning');
  }

  showInfo(message: string): void {
    this.showToast(message, 'Info');
  }

  private showToast(message: string, type: string): void {
    const panelClass = this.getPanelClass(type);
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  private getPanelClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'success':
        return 'snackbar-success';
      case 'error':
        return 'snackbar-error';
      case 'warning':
        return 'snackbar-warning';
      default:
        return 'snackbar-info';
    }
  }
}
