import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InventoryItem } from '../../../core/models';

@Component({
  selector: 'app-inventory-form',
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Item' : 'Add New Item' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="itemForm">
        <div class="form-row two-cols">
          <mat-form-field appearance="outline">
            <mat-label>SKU</mat-label>
            <input matInput formControlName="sku" placeholder="Enter SKU">
            <mat-error *ngIf="itemForm.get('sku')?.hasError('required')">SKU is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</mat-option>
            </mat-select>
            <mat-error *ngIf="itemForm.get('category')?.hasError('required')">Category is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter item name">
            <mat-error *ngIf="itemForm.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Enter description"></textarea>
          </mat-form-field>
        </div>

        <div class="form-row three-cols">
          <mat-form-field appearance="outline">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" min="0">
            <mat-error *ngIf="itemForm.get('quantity')?.hasError('required')">Quantity is required</mat-error>
            <mat-error *ngIf="itemForm.get('quantity')?.hasError('min')">Must be 0 or greater</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Unit Price</mat-label>
            <span matPrefix>$ </span>
            <input matInput type="number" formControlName="unitPrice" min="0" step="0.01">
            <mat-error *ngIf="itemForm.get('unitPrice')?.hasError('required')">Price is required</mat-error>
            <mat-error *ngIf="itemForm.get('unitPrice')?.hasError('min')">Must be positive</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Reorder Level</mat-label>
            <input matInput type="number" formControlName="reorderLevel" min="0">
            <mat-error *ngIf="itemForm.get('reorderLevel')?.hasError('required')">Required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row two-cols">
          <mat-form-field appearance="outline">
            <mat-label>Supplier</mat-label>
            <input matInput formControlName="supplier" placeholder="Enter supplier name">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" placeholder="Warehouse location">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-slide-toggle formControlName="isActive">Active</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="itemForm.invalid || isSubmitting">
        <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
        <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update' : 'Create' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
    }
    .form-row {
      margin-bottom: 8px;
    }
    .form-row.two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-row.three-cols {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class InventoryFormComponent implements OnInit {
  itemForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  categories = ['Electronics', 'Furniture', 'Office Supplies', 'Hardware', 'Software', 'Other'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<InventoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item?: InventoryItem }
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.item;
    this.initForm();
  }

  initForm(): void {
    const item = this.data?.item;
    this.itemForm = this.fb.group({
      sku: [item?.sku || '', Validators.required],
      name: [item?.name || '', Validators.required],
      description: [item?.description || ''],
      category: [item?.category || '', Validators.required],
      quantity: [item?.quantity || 0, [Validators.required, Validators.min(0)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      reorderLevel: [item?.reorderLevel || 10, [Validators.required, Validators.min(0)]],
      supplier: [item?.supplier || ''],
      location: [item?.location || ''],
      isActive: [item?.isActive ?? true]
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;

    this.isSubmitting = true;
    const itemData = this.itemForm.value;

    const request$ = this.isEditMode
      ? this.apiService.put(`inventory/${this.data.item!.id}`, itemData)
      : this.apiService.post('inventory', itemData);

    request$.subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `Item ${this.isEditMode ? 'updated' : 'created'} successfully`
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
