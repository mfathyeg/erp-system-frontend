import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, UserRole } from '../../../core/models';

@Component({
  selector: 'app-user-form',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ isEditMode ? 'Edit User' : 'Create User' }}</h2>
        <button class="close-btn" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <form [formGroup]="userForm">
          <div class="form-group">
            <label>Username</label>
            <div class="input-wrapper">
              <mat-icon>person</mat-icon>
              <input type="text" formControlName="username" placeholder="Enter username">
            </div>
            <span class="error-text" *ngIf="userForm.get('username')?.hasError('required') && userForm.get('username')?.touched">
              Username is required
            </span>
            <span class="error-text" *ngIf="userForm.get('username')?.hasError('minlength')">
              Minimum 3 characters
            </span>
          </div>

          <div class="form-group">
            <label>Email</label>
            <div class="input-wrapper">
              <mat-icon>email</mat-icon>
              <input type="email" formControlName="email" placeholder="Enter email">
            </div>
            <span class="error-text" *ngIf="userForm.get('email')?.hasError('required') && userForm.get('email')?.touched">
              Email is required
            </span>
            <span class="error-text" *ngIf="userForm.get('email')?.hasError('email')">
              Invalid email format
            </span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <div class="input-wrapper">
                <input type="text" formControlName="firstName" placeholder="First name">
              </div>
              <span class="error-text" *ngIf="userForm.get('firstName')?.hasError('required') && userForm.get('firstName')?.touched">
                Required
              </span>
            </div>

            <div class="form-group">
              <label>Last Name</label>
              <div class="input-wrapper">
                <input type="text" formControlName="lastName" placeholder="Last name">
              </div>
              <span class="error-text" *ngIf="userForm.get('lastName')?.hasError('required') && userForm.get('lastName')?.touched">
                Required
              </span>
            </div>
          </div>

          <div class="form-group" *ngIf="!isEditMode">
            <label>Password</label>
            <div class="input-wrapper">
              <mat-icon>lock</mat-icon>
              <input [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter password">
              <button type="button" class="toggle-btn" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
            <span class="error-text" *ngIf="userForm.get('password')?.hasError('required') && userForm.get('password')?.touched">
              Password is required
            </span>
            <span class="error-text" *ngIf="userForm.get('password')?.hasError('minlength')">
              Minimum 8 characters
            </span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Role</label>
              <select formControlName="role">
                <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
              </select>
            </div>

            <div class="form-group toggle-group">
              <label>Status</label>
              <label class="toggle-switch">
                <input type="checkbox" formControlName="isActive">
                <span class="toggle-slider"></span>
                <span class="toggle-label">{{ userForm.get('isActive')?.value ? 'Active' : 'Inactive' }}</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      <div class="dialog-actions">
        <button class="btn-cancel" mat-dialog-close>Cancel</button>
        <button class="btn-submit" (click)="onSubmit()" [disabled]="userForm.invalid || isSubmitting">
          <div class="spinner" *ngIf="isSubmitting"></div>
          <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update' : 'Create' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 450px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--card-bg-hover);
      color: var(--text-primary);
    }

    .dialog-content {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0 14px;
      transition: all 0.2s ease;
    }

    .input-wrapper:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .input-wrapper mat-icon {
      color: var(--text-muted);
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .input-wrapper input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 12px 0;
      color: var(--text-primary);
      font-size: 14px;
    }

    .input-wrapper input::placeholder {
      color: var(--text-muted);
    }

    .toggle-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
    }

    select {
      width: 100%;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 12px 14px;
      color: var(--text-primary);
      font-size: 14px;
      cursor: pointer;
    }

    select:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .error-text {
      display: block;
      margin-top: 6px;
      font-size: 12px;
      color: var(--danger-color);
    }

    .toggle-group {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .toggle-switch {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding-top: 8px;
    }

    .toggle-switch input {
      display: none;
    }

    .toggle-slider {
      width: 44px;
      height: 24px;
      background: var(--border-light);
      border-radius: 12px;
      position: relative;
      transition: all 0.3s ease;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      background: white;
      border-radius: 50%;
      top: 3px;
      left: 3px;
      transition: all 0.3s ease;
    }

    .toggle-switch input:checked + .toggle-slider {
      background: var(--success-color);
    }

    .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }

    .toggle-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
    }

    .btn-cancel, .btn-submit {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    .btn-cancel:hover {
      background: var(--card-bg-hover);
    }

    .btn-submit {
      background: var(--gradient-primary);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-submit:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  hidePassword = true;
  roles = Object.values(UserRole);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.user;
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: [this.data?.user?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [this.data?.user?.email || '', [Validators.required, Validators.email]],
      firstName: [this.data?.user?.firstName || '', Validators.required],
      lastName: [this.data?.user?.lastName || '', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      role: [this.data?.user?.role || UserRole.Employee, Validators.required],
      isActive: [this.data?.user?.isActive ?? true]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    const userData = this.userForm.value;

    const request$ = this.isEditMode
      ? this.apiService.put(`users/${this.data.user!.id}`, userData)
      : this.apiService.post('users', userData);

    request$.subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `User ${this.isEditMode ? 'updated' : 'created'} successfully`
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
