import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, UserRole } from '../../../core/models';

@Component({
  selector: 'app-user-form',
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit User' : 'Create User' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="userForm">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Enter username">
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">Username is required</mat-error>
            <mat-error *ngIf="userForm.get('username')?.hasError('minlength')">Minimum 3 characters</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter email">
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">Invalid email format</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row two-cols">
          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" placeholder="First name">
            <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">First name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" placeholder="Last name">
            <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">Last name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="!isEditMode">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">Minimum 8 characters</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row two-cols">
          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option *ngFor="let role of roles" [value]="role">{{ role }}</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('role')?.hasError('required')">Role is required</mat-error>
          </mat-form-field>

          <div class="status-toggle">
            <mat-slide-toggle formControlName="isActive">Active</mat-slide-toggle>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="userForm.invalid || isSubmitting">
        <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
        <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update' : 'Create' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
    .form-row {
      margin-bottom: 8px;
    }
    .form-row.two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .status-toggle {
      display: flex;
      align-items: center;
      padding-top: 8px;
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
