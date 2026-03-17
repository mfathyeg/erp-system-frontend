import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Notification } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionStateSubject = new BehaviorSubject<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );

  public connectionState$ = this.connectionStateSubject.asObservable();
  public notificationReceived$ = new Subject<Notification>();
  public orderUpdated$ = new Subject<{ orderId: number; status: string }>();
  public inventoryAlert$ = new Subject<{ itemId: number; message: string }>();

  constructor(private authService: AuthService) {}

  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn('No auth token available for SignalR connection');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/notifications`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.registerHandlers();
    this.registerConnectionEvents();

    try {
      await this.hubConnection.start();
      console.log('SignalR Connected');
      this.connectionStateSubject.next(signalR.HubConnectionState.Connected);
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      this.connectionStateSubject.next(signalR.HubConnectionState.Disconnected);
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR Disconnected');
      } catch (err) {
        console.error('SignalR Disconnect Error:', err);
      }
      this.connectionStateSubject.next(signalR.HubConnectionState.Disconnected);
    }
  }

  private registerHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      this.notificationReceived$.next(notification);
    });

    this.hubConnection.on('OrderStatusUpdated', (data: { orderId: number; status: string }) => {
      this.orderUpdated$.next(data);
    });

    this.hubConnection.on('InventoryAlert', (data: { itemId: number; message: string }) => {
      this.inventoryAlert$.next(data);
    });
  }

  private registerConnectionEvents(): void {
    if (!this.hubConnection) return;

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
      this.connectionStateSubject.next(signalR.HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR Reconnected');
      this.connectionStateSubject.next(signalR.HubConnectionState.Connected);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR Connection Closed');
      this.connectionStateSubject.next(signalR.HubConnectionState.Disconnected);
    });
  }

  async joinGroup(groupName: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinGroup', groupName);
    }
  }

  async leaveGroup(groupName: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveGroup', groupName);
    }
  }
}
