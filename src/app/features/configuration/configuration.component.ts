import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { CompanySettings, SystemConfiguration, ConfigCategory } from '../../core/models';

@Component({
  selector: 'app-configuration',
  template: `
    <div class="configuration-container">
      <app-page-header title="Configuration" subtitle="Manage system settings"></app-page-header>

      <mat-tab-group>
        <mat-tab label="Company Settings">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Company Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="companyForm" (ngSubmit)="saveCompanySettings()">
                  <div class="form-row two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Company Name</mat-label>
                      <input matInput formControlName="companyName">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Tax ID</mat-label>
                      <input matInput formControlName="taxId">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Address</mat-label>
                      <textarea matInput formControlName="address" rows="2"></textarea>
                    </mat-form-field>
                  </div>

                  <div class="form-row two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Phone</mat-label>
                      <input matInput formControlName="phone">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Email</mat-label>
                      <input matInput type="email" formControlName="email">
                    </mat-form-field>
                  </div>

                  <div class="form-row two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Website</mat-label>
                      <input matInput formControlName="website">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Currency</mat-label>
                      <mat-select formControlName="currency">
                        <mat-option value="USD">USD - US Dollar</mat-option>
                        <mat-option value="EUR">EUR - Euro</mat-option>
                        <mat-option value="GBP">GBP - British Pound</mat-option>
                        <mat-option value="JPY">JPY - Japanese Yen</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-row two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Timezone</mat-label>
                      <mat-select formControlName="timezone">
                        <mat-option value="America/New_York">Eastern Time (ET)</mat-option>
                        <mat-option value="America/Chicago">Central Time (CT)</mat-option>
                        <mat-option value="America/Denver">Mountain Time (MT)</mat-option>
                        <mat-option value="America/Los_Angeles">Pacific Time (PT)</mat-option>
                        <mat-option value="UTC">UTC</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Date Format</mat-label>
                      <mat-select formControlName="dateFormat">
                        <mat-option value="MM/DD/YYYY">MM/DD/YYYY</mat-option>
                        <mat-option value="DD/MM/YYYY">DD/MM/YYYY</mat-option>
                        <mat-option value="YYYY-MM-DD">YYYY-MM-DD</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button color="primary" type="submit" [disabled]="companyForm.invalid || isSaving">
                      <mat-spinner *ngIf="isSaving" diameter="20"></mat-spinner>
                      <span *ngIf="!isSaving">Save Changes</span>
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="System Settings">
          <div class="tab-content">
            <mat-card *ngFor="let category of configCategories">
              <mat-card-header>
                <mat-card-title>{{ category }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="settings-list">
                  <div class="setting-item" *ngFor="let config of getConfigsByCategory(category)">
                    <div class="setting-info">
                      <span class="setting-key">{{ config.key }}</span>
                      <span class="setting-description">{{ config.description }}</span>
                    </div>
                    <div class="setting-value">
                      <mat-form-field appearance="outline" *ngIf="config.isEditable">
                        <input matInput [(ngModel)]="config.value" (blur)="updateConfig(config)">
                      </mat-form-field>
                      <span *ngIf="!config.isEditable" class="readonly-value">{{ config.value }}</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Notification Preferences">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Notification Settings</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="notification-settings">
                  <div class="setting-toggle">
                    <div class="toggle-info">
                      <span class="toggle-label">Email Notifications</span>
                      <span class="toggle-description">Receive notifications via email</span>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notificationPrefs.emailNotifications"
                                      (change)="saveNotificationPrefs()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="setting-toggle">
                    <div class="toggle-info">
                      <span class="toggle-label">Push Notifications</span>
                      <span class="toggle-description">Receive browser push notifications</span>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notificationPrefs.pushNotifications"
                                      (change)="saveNotificationPrefs()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="setting-toggle">
                    <div class="toggle-info">
                      <span class="toggle-label">Order Updates</span>
                      <span class="toggle-description">Get notified about order status changes</span>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notificationPrefs.orderUpdates"
                                      (change)="saveNotificationPrefs()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="setting-toggle">
                    <div class="toggle-info">
                      <span class="toggle-label">Inventory Alerts</span>
                      <span class="toggle-description">Get notified about low stock items</span>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notificationPrefs.inventoryAlerts"
                                      (change)="saveNotificationPrefs()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="setting-toggle">
                    <div class="toggle-info">
                      <span class="toggle-label">System Alerts</span>
                      <span class="toggle-description">Get notified about system updates and maintenance</span>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notificationPrefs.systemAlerts"
                                      (change)="saveNotificationPrefs()">
                    </mat-slide-toggle>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tab-content {
      padding: 24px 0;
    }
    .tab-content mat-card {
      margin-bottom: 24px;
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
    .form-actions {
      padding-top: 16px;
    }
    .settings-list {
      display: flex;
      flex-direction: column;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .setting-item:last-child {
      border-bottom: none;
    }
    .setting-info {
      display: flex;
      flex-direction: column;
    }
    .setting-key {
      font-weight: 500;
    }
    .setting-description {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    .setting-value mat-form-field {
      width: 200px;
    }
    .readonly-value {
      color: rgba(0, 0, 0, 0.6);
      font-family: monospace;
    }
    .notification-settings {
      display: flex;
      flex-direction: column;
    }
    .setting-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }
    .toggle-info {
      display: flex;
      flex-direction: column;
    }
    .toggle-label {
      font-weight: 500;
    }
    .toggle-description {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    @media (max-width: 600px) {
      .form-row.two-cols {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ConfigurationComponent implements OnInit {
  companyForm!: FormGroup;
  isSaving = false;
  systemConfigs: SystemConfiguration[] = [];
  configCategories = Object.values(ConfigCategory);

  notificationPrefs = {
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    inventoryAlerts: true,
    systemAlerts: true
  };

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initCompanyForm();
    this.loadCompanySettings();
    this.loadSystemConfigs();
  }

  initCompanyForm(): void {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      address: [''],
      phone: [''],
      email: ['', Validators.email],
      website: [''],
      taxId: [''],
      currency: ['USD'],
      timezone: ['America/New_York'],
      dateFormat: ['MM/DD/YYYY']
    });
  }

  loadCompanySettings(): void {
    this.apiService.get<CompanySettings>('configuration/company').subscribe({
      next: (settings) => this.companyForm.patchValue(settings),
      error: () => {
        this.companyForm.patchValue({
          companyName: 'ERP System Inc.',
          address: '123 Business Ave, Suite 100',
          phone: '+1 (555) 123-4567',
          email: 'info@erpsystem.com',
          website: 'https://erpsystem.com',
          taxId: '12-3456789',
          currency: 'USD',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY'
        });
      }
    });
  }

  loadSystemConfigs(): void {
    this.apiService.get<SystemConfiguration[]>('configuration/system').subscribe({
      next: (configs) => this.systemConfigs = configs,
      error: () => this.systemConfigs = this.getMockConfigs()
    });
  }

  saveCompanySettings(): void {
    if (this.companyForm.invalid) return;

    this.isSaving = true;
    this.apiService.put('configuration/company', this.companyForm.value).subscribe({
      next: () => {
        this.notificationService.showSuccess('Company settings saved successfully');
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  updateConfig(config: SystemConfiguration): void {
    this.apiService.put(`configuration/system/${config.id}`, { value: config.value }).subscribe({
      next: () => this.notificationService.showSuccess('Setting updated')
    });
  }

  saveNotificationPrefs(): void {
    this.apiService.put('configuration/notifications', this.notificationPrefs).subscribe({
      next: () => this.notificationService.showSuccess('Notification preferences saved')
    });
  }

  getConfigsByCategory(category: ConfigCategory): SystemConfiguration[] {
    return this.systemConfigs.filter(c => c.category === category);
  }

  private getMockConfigs(): SystemConfiguration[] {
    return [
      { id: 1, key: 'MAX_LOGIN_ATTEMPTS', value: '5', category: ConfigCategory.Security, description: 'Maximum login attempts before lockout', isEditable: true },
      { id: 2, key: 'SESSION_TIMEOUT', value: '30', category: ConfigCategory.Security, description: 'Session timeout in minutes', isEditable: true },
      { id: 3, key: 'LOW_STOCK_THRESHOLD', value: '10', category: ConfigCategory.Inventory, description: 'Default low stock alert threshold', isEditable: true },
      { id: 4, key: 'ORDER_PREFIX', value: 'ORD', category: ConfigCategory.Orders, description: 'Order number prefix', isEditable: true },
      { id: 5, key: 'TAX_RATE', value: '8.5', category: ConfigCategory.Finance, description: 'Default tax rate percentage', isEditable: true }
    ];
  }
}
