import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, delay, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, RegisterRequest, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'erp_token';
  private readonly REFRESH_TOKEN_KEY = 'erp_refresh_token';
  private readonly USER_KEY = 'erp_user';

  // Demo users for testing without backend (fallback)
  // When connected to backend, use: admin/Admin123!, manager/Manager123!, user/User123!
  private readonly DEMO_USERS: { username: string; password: string; user: User }[] = [
    {
      username: 'admin',
      password: 'Admin123!',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        email: 'admin@duralux.sa',
        firstName: 'أحمد',
        lastName: 'محمد',
        role: UserRole.Admin,
        isActive: true,
        createdAt: new Date()
      }
    },
    {
      username: 'manager',
      password: 'Manager123!',
      user: {
        id: '00000000-0000-0000-0000-000000000002',
        username: 'manager',
        email: 'manager@duralux.sa',
        firstName: 'سارة',
        lastName: 'علي',
        role: UserRole.Manager,
        isActive: true,
        createdAt: new Date()
      }
    },
    {
      username: 'user',
      password: 'User123!',
      user: {
        id: '00000000-0000-0000-0000-000000000003',
        username: 'user',
        email: 'user@duralux.sa',
        firstName: 'محمد',
        lastName: 'خالد',
        role: UserRole.Employee,
        isActive: true,
        createdAt: new Date()
      }
    }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Try demo login first
    const demoUser = this.DEMO_USERS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (demoUser) {
      // Simulate API delay
      const mockResponse: LoginResponse = {
        token: 'demo-jwt-token-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
        user: demoUser.user,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      return of(mockResponse).pipe(
        delay(500), // Simulate network delay
        tap(response => this.handleAuthResponse(response))
      );
    }

    // If not a demo user, check if credentials were provided but wrong
    const isAttemptingDemoLogin = this.DEMO_USERS.some(u => u.username === credentials.username);
    if (isAttemptingDemoLogin) {
      return throwError(() => new Error('كلمة المرور غير صحيحة. جرب: Admin123!, Manager123!, أو User123!'));
    }

    // Try real API (will fail if no backend)
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();

    // For demo mode, just return a new token
    if (refreshToken?.startsWith('demo-')) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const mockResponse: LoginResponse = {
          token: 'demo-jwt-token-' + Date.now(),
          refreshToken: 'demo-refresh-token-' + Date.now(),
          user: currentUser,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        return of(mockResponse).pipe(
          tap(response => this.handleAuthResponse(response))
        );
      }
    }

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  isAdmin(): boolean {
    return this.hasRole([UserRole.Admin]);
  }

  isManager(): boolean {
    return this.hasRole([UserRole.Admin, UserRole.Manager]);
  }

  private handleAuthResponse(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
