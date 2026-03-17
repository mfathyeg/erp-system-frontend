import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <img src="assets/logo.png" alt="ERP System" class="login-logo">
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <h2>Welcome Back</h2>
          <p class="subtitle">Sign in to your account</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter your username">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput
                     [type]="hidePassword ? 'password' : 'text'"
                     formControlName="password"
                     placeholder="Enter your password">
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="form-options">
              <mat-checkbox formControlName="rememberMe">Remember me</mat-checkbox>
              <a mat-button color="primary" routerLink="/auth/forgot-password">
                Forgot password?
              </a>
            </div>

            <button mat-raised-button
                    color="primary"
                    class="full-width login-btn"
                    type="submit"
                    [disabled]="loginForm.invalid || isLoading">
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading">Sign In</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <p class="footer-text">
        &copy; {{ currentYear }} ERP System. All rights reserved.
      </p>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
      padding: 24px;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }
    mat-card-header {
      justify-content: center;
      margin-bottom: 16px;
    }
    .login-logo {
      max-width: 200px;
      max-height: 60px;
    }
    h2 {
      text-align: center;
      margin: 0 0 8px;
      font-weight: 500;
    }
    .subtitle {
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 24px;
    }
    .full-width {
      width: 100%;
    }
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .login-btn {
      height: 48px;
      font-size: 16px;
    }
    .login-btn mat-spinner {
      display: inline-block;
    }
    .footer-text {
      color: rgba(255, 255, 255, 0.7);
      margin-top: 24px;
      font-size: 14px;
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
