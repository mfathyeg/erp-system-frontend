import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-wrapper">
        <div class="login-card">
          <!-- Logo -->
          <div class="logo-section">
            <div class="logo-icon">
              <span>D</span>
            </div>
            <div class="logo-text">
              <span class="brand">Duralux</span>
              <span class="tagline">ERP System</span>
            </div>
          </div>

          <!-- Welcome Text -->
          <div class="welcome-section">
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Username</label>
              <div class="input-wrapper">
                <mat-icon>person_outline</mat-icon>
                <input type="text" formControlName="username" placeholder="Enter your username">
              </div>
              <span class="error-text" *ngIf="loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched">
                Username is required
              </span>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <mat-icon>lock_outline</mat-icon>
                <input [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password">
                <button type="button" class="toggle-password" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <span class="error-text" *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
                Password is required
              </span>
            </div>

            <div class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" formControlName="rememberMe">
                <span class="checkmark"></span>
                <span class="label-text">Remember me</span>
              </label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" class="btn-login" [disabled]="loginForm.invalid || isLoading">
              <div class="spinner" *ngIf="isLoading"></div>
              <span *ngIf="!isLoading">Sign In</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="divider">
            <span>or continue with</span>
          </div>

          <!-- Social Login -->
          <div class="social-login">
            <button class="social-btn google">
              <mat-icon>g_mobiledata</mat-icon>
              Google
            </button>
            <button class="social-btn microsoft">
              <mat-icon>window</mat-icon>
              Microsoft
            </button>
          </div>
        </div>

        <!-- Footer -->
        <p class="footer-text">
          &copy; {{ currentYear }} Duralux ERP System. All rights reserved.
        </p>
      </div>

      <!-- Background Animation -->
      <div class="bg-animation">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--primary-bg);
      position: relative;
      overflow: hidden;
    }

    .login-wrapper {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      width: 100%;
      max-width: 440px;
    }

    .login-card {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 40px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
      justify-content: center;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: var(--gradient-primary);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .brand {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .tagline {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .welcome-section h1 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .welcome-section p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0 16px;
      transition: all 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .input-wrapper mat-icon {
      color: var(--text-muted);
      font-size: 20px;
    }

    .input-wrapper input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 14px 0;
      color: var(--text-primary);
      font-size: 14px;
    }

    .input-wrapper input::placeholder {
      color: var(--text-muted);
    }

    .toggle-password {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
      align-items: center;
    }

    .toggle-password:hover {
      color: var(--text-secondary);
    }

    .error-text {
      display: block;
      margin-top: 6px;
      font-size: 12px;
      color: var(--danger-color);
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .checkbox-wrapper input {
      display: none;
    }

    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-light);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .checkbox-wrapper input:checked + .checkmark {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    .checkbox-wrapper input:checked + .checkmark::after {
      content: '✓';
      color: white;
      font-size: 12px;
    }

    .forgot-link {
      color: var(--primary-light);
      font-size: 14px;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .forgot-link:hover {
      color: var(--primary-color);
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: var(--gradient-primary);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 24px 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border-color);
    }

    .divider span {
      padding: 0 16px;
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .social-login {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .social-btn:hover {
      background: var(--card-bg-hover);
      border-color: var(--border-light);
    }

    .social-btn mat-icon {
      font-size: 20px;
    }

    .footer-text {
      margin-top: 24px;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Background Animation */
    .bg-animation {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.3;
    }

    .orb-1 {
      width: 400px;
      height: 400px;
      background: var(--primary-color);
      top: -100px;
      right: -100px;
      animation: float 8s ease-in-out infinite;
    }

    .orb-2 {
      width: 300px;
      height: 300px;
      background: var(--accent-color);
      bottom: -50px;
      left: -50px;
      animation: float 10s ease-in-out infinite reverse;
    }

    .orb-3 {
      width: 200px;
      height: 200px;
      background: var(--info-color);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(30px, 30px); }
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.2; }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px;
      }

      .social-login {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  currentYear = new Date().getFullYear();
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Login successful!');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
