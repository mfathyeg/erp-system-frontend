import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { CompanySettings, SystemConfiguration, ConfigCategory } from '../../core/models';

@Component({
  selector: 'app-configuration',
  template: `
    <div class="configuration-container">
      <app-page-header
        title="الإعدادات"
        subtitle="إدارة إعدادات النظام والتفضيلات"
        [breadcrumb]="['لوحة التحكم', 'الإعدادات']">
      </app-page-header>

      <div class="tabs-container">
        <div class="tab-list">
          <button class="tab-btn" [class.active]="activeTab === 'company'" (click)="activeTab = 'company'">
            <mat-icon>business</mat-icon>
            إعدادات الشركة
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'system'" (click)="activeTab = 'system'">
            <mat-icon>settings</mat-icon>
            إعدادات النظام
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
            <mat-icon>notifications</mat-icon>
            الإشعارات
          </button>
        </div>

        <!-- Company Settings Tab -->
        <div class="tab-content" *ngIf="activeTab === 'company'">
          <div class="content-card">
            <div class="card-header">
              <div class="header-icon">
                <mat-icon>business</mat-icon>
              </div>
              <div class="header-text">
                <h3>معلومات الشركة</h3>
                <p>المعلومات الأساسية عن شركتك</p>
              </div>
            </div>

            <form [formGroup]="companyForm" (ngSubmit)="saveCompanySettings()">
              <div class="form-grid">
                <div class="form-group">
                  <label>اسم الشركة</label>
                  <div class="input-wrapper">
                    <mat-icon>business</mat-icon>
                    <input type="text" formControlName="companyName" placeholder="أدخل اسم الشركة">
                  </div>
                </div>

                <div class="form-group">
                  <label>الرقم الضريبي</label>
                  <div class="input-wrapper">
                    <mat-icon>receipt</mat-icon>
                    <input type="text" formControlName="taxId" placeholder="أدخل الرقم الضريبي">
                  </div>
                </div>
              </div>

              <div class="form-group full-width">
                <label>العنوان</label>
                <div class="input-wrapper textarea-wrapper">
                  <mat-icon>location_on</mat-icon>
                  <textarea formControlName="address" rows="2" placeholder="أدخل عنوان الشركة"></textarea>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>الهاتف</label>
                  <div class="input-wrapper">
                    <mat-icon>phone</mat-icon>
                    <input type="text" formControlName="phone" placeholder="أدخل رقم الهاتف">
                  </div>
                </div>

                <div class="form-group">
                  <label>البريد الإلكتروني</label>
                  <div class="input-wrapper">
                    <mat-icon>email</mat-icon>
                    <input type="email" formControlName="email" placeholder="أدخل البريد الإلكتروني">
                  </div>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>الموقع الإلكتروني</label>
                  <div class="input-wrapper">
                    <mat-icon>language</mat-icon>
                    <input type="text" formControlName="website" placeholder="أدخل رابط الموقع">
                  </div>
                </div>

                <div class="form-group">
                  <label>العملة</label>
                  <select formControlName="currency">
                    <option value="SAR">ر.س - ريال سعودي</option>
                    <option value="AED">د.إ - درهم إماراتي</option>
                    <option value="USD">$ - دولار أمريكي</option>
                    <option value="EUR">€ - يورو</option>
                  </select>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>المنطقة الزمنية</label>
                  <select formControlName="timezone">
                    <option value="Asia/Riyadh">توقيت الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">توقيت دبي (GMT+4)</option>
                    <option value="Africa/Cairo">توقيت القاهرة (GMT+2)</option>
                    <option value="Asia/Kuwait">توقيت الكويت (GMT+3)</option>
                    <option value="UTC">التوقيت العالمي (UTC)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>صيغة التاريخ</label>
                  <select formControlName="dateFormat">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-save" [disabled]="companyForm.invalid || isSaving">
                  <div class="spinner" *ngIf="isSaving"></div>
                  <mat-icon *ngIf="!isSaving">save</mat-icon>
                  <span>{{ isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- System Settings Tab -->
        <div class="tab-content" *ngIf="activeTab === 'system'">
          <div class="content-card" *ngFor="let category of configCategories">
            <div class="card-header">
              <div class="header-icon" [ngClass]="getCategoryColor(category)">
                <mat-icon>{{ getCategoryIcon(category) }}</mat-icon>
              </div>
              <div class="header-text">
                <h3>{{ getCategoryArabic(category) }}</h3>
                <p>إعدادات {{ getCategoryArabic(category) }}</p>
              </div>
            </div>

            <div class="settings-list">
              <div class="setting-item" *ngFor="let config of getConfigsByCategory(category)">
                <div class="setting-info">
                  <span class="setting-key">{{ config.key }}</span>
                  <span class="setting-description">{{ getConfigDescriptionArabic(config.key) }}</span>
                </div>
                <div class="setting-value">
                  <div class="input-wrapper small" *ngIf="config.isEditable">
                    <input type="text" [(ngModel)]="config.value" (blur)="updateConfig(config)">
                  </div>
                  <span class="readonly-value" *ngIf="!config.isEditable">{{ config.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Preferences Tab -->
        <div class="tab-content" *ngIf="activeTab === 'notifications'">
          <div class="content-card">
            <div class="card-header">
              <div class="header-icon purple">
                <mat-icon>notifications</mat-icon>
              </div>
              <div class="header-text">
                <h3>تفضيلات الإشعارات</h3>
                <p>التحكم في كيفية ووقت استلام الإشعارات</p>
              </div>
            </div>

            <div class="notification-settings">
              <div class="setting-toggle">
                <div class="toggle-info">
                  <div class="toggle-icon">
                    <mat-icon>email</mat-icon>
                  </div>
                  <div class="toggle-text">
                    <span class="toggle-label">إشعارات البريد الإلكتروني</span>
                    <span class="toggle-description">استلام الإشعارات عبر البريد الإلكتروني</span>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="notificationPrefs.emailNotifications" (change)="saveNotificationPrefs()">
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-toggle">
                <div class="toggle-info">
                  <div class="toggle-icon">
                    <mat-icon>notifications_active</mat-icon>
                  </div>
                  <div class="toggle-text">
                    <span class="toggle-label">إشعارات الدفع</span>
                    <span class="toggle-description">استلام إشعارات المتصفح الفورية</span>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="notificationPrefs.pushNotifications" (change)="saveNotificationPrefs()">
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-toggle">
                <div class="toggle-info">
                  <div class="toggle-icon">
                    <mat-icon>shopping_cart</mat-icon>
                  </div>
                  <div class="toggle-text">
                    <span class="toggle-label">تحديثات الطلبات</span>
                    <span class="toggle-description">الإشعار بتغييرات حالة الطلبات</span>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="notificationPrefs.orderUpdates" (change)="saveNotificationPrefs()">
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-toggle">
                <div class="toggle-info">
                  <div class="toggle-icon">
                    <mat-icon>inventory_2</mat-icon>
                  </div>
                  <div class="toggle-text">
                    <span class="toggle-label">تنبيهات المخزون</span>
                    <span class="toggle-description">الإشعار عند انخفاض المخزون</span>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="notificationPrefs.inventoryAlerts" (change)="saveNotificationPrefs()">
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-toggle">
                <div class="toggle-info">
                  <div class="toggle-icon">
                    <mat-icon>settings_suggest</mat-icon>
                  </div>
                  <div class="toggle-text">
                    <span class="toggle-label">تنبيهات النظام</span>
                    <span class="toggle-description">الإشعار بتحديثات وصيانة النظام</span>
                  </div>
                </div>
                <label class="switch">
                  <input type="checkbox" [(ngModel)]="notificationPrefs.systemAlerts" (change)="saveNotificationPrefs()">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tabs-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .tab-list {
      display: flex;
      gap: 8px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 8px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: transparent;
      border: none;
      border-radius: 10px;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      background: var(--card-bg-hover);
    }

    .tab-btn.active {
      background: var(--gradient-primary);
      color: white;
    }

    .tab-btn mat-icon {
      font-size: 20px;
    }

    .content-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .card-header {
      display: flex;
      gap: 16px;
      padding: 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary-color);
    }

    .header-icon.success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success-color);
    }

    .header-icon.warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning-color);
    }

    .header-icon.info {
      background: rgba(59, 130, 246, 0.15);
      color: var(--info-color);
    }

    .header-icon.purple {
      background: rgba(139, 92, 246, 0.15);
      color: var(--accent-color);
    }

    .header-icon.danger {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger-color);
    }

    .header-text h3 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-text p {
      margin: 0;
      font-size: 13px;
      color: var(--text-muted);
    }

    form {
      padding: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full-width {
      margin-bottom: 20px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
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

    .input-wrapper input, .input-wrapper textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 12px 0;
      color: var(--text-primary);
      font-size: 14px;
      resize: none;
    }

    .input-wrapper.textarea-wrapper {
      align-items: flex-start;
      padding-top: 12px;
    }

    .input-wrapper.small {
      padding: 0 10px;
    }

    .input-wrapper.small input {
      padding: 8px 0;
      text-align: right;
      font-family: monospace;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
      margin-top: 24px;
    }

    .btn-save {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--gradient-primary);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .btn-save:disabled {
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

    /* Settings List */
    .settings-list {
      padding: 8px 24px 24px;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .setting-key {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      font-family: monospace;
    }

    .setting-description {
      font-size: 12px;
      color: var(--text-muted);
    }

    .readonly-value {
      color: var(--text-muted);
      font-family: monospace;
      font-size: 14px;
      padding: 8px 12px;
      background: var(--secondary-bg);
      border-radius: 6px;
    }

    /* Notification Settings */
    .notification-settings {
      padding: 8px 24px 24px;
    }

    .setting-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .setting-toggle:last-child {
      border-bottom: none;
    }

    .toggle-info {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .toggle-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--secondary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .toggle-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toggle-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .toggle-description {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Toggle Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 26px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--border-light);
      border-radius: 26px;
      transition: all 0.3s ease;
    }

    .slider::before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      right: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .switch input:checked + .slider {
      background: var(--success-color);
    }

    .switch input:checked + .slider::before {
      transform: translateX(-22px);
    }

    @media (max-width: 768px) {
      .tab-list {
        flex-wrap: wrap;
      }

      .form-grid {
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
  activeTab = 'company';

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
      currency: ['SAR'],
      timezone: ['Asia/Riyadh'],
      dateFormat: ['DD/MM/YYYY']
    });
  }

  loadCompanySettings(): void {
    this.apiService.get<CompanySettings>('configuration/company').subscribe({
      next: (settings) => this.companyForm.patchValue(settings),
      error: () => {
        this.companyForm.patchValue({
          companyName: 'شركة دورالوكس',
          address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
          phone: '+966 11 234 5678',
          email: 'info@duralux.sa',
          website: 'https://duralux.sa',
          taxId: '300123456789003',
          currency: 'SAR',
          timezone: 'Asia/Riyadh',
          dateFormat: 'DD/MM/YYYY'
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
        this.notificationService.showSuccess('تم حفظ إعدادات الشركة بنجاح');
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  updateConfig(config: SystemConfiguration): void {
    this.apiService.put(`configuration/system/${config.id}`, { value: config.value }).subscribe({
      next: () => this.notificationService.showSuccess('تم تحديث الإعداد')
    });
  }

  saveNotificationPrefs(): void {
    this.apiService.put('configuration/notifications', this.notificationPrefs).subscribe({
      next: () => this.notificationService.showSuccess('تم حفظ تفضيلات الإشعارات')
    });
  }

  getConfigsByCategory(category: ConfigCategory): SystemConfiguration[] {
    return this.systemConfigs.filter(c => c.category === category);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      Security: 'security',
      Inventory: 'inventory_2',
      Orders: 'shopping_cart',
      Finance: 'account_balance_wallet',
      General: 'settings'
    };
    return icons[category] || 'settings';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      Security: 'danger',
      Inventory: 'success',
      Orders: 'purple',
      Finance: 'warning',
      General: 'info'
    };
    return colors[category] || '';
  }

  getCategoryArabic(category: string): string {
    const categories: { [key: string]: string } = {
      Security: 'الأمان',
      Inventory: 'المخزون',
      Orders: 'الطلبات',
      Finance: 'المالية',
      General: 'عام'
    };
    return categories[category] || category;
  }

  getConfigDescriptionArabic(key: string): string {
    const descriptions: { [key: string]: string } = {
      MAX_LOGIN_ATTEMPTS: 'الحد الأقصى لمحاولات تسجيل الدخول قبل القفل',
      SESSION_TIMEOUT: 'مهلة انتهاء الجلسة بالدقائق',
      LOW_STOCK_THRESHOLD: 'حد التنبيه الافتراضي للمخزون المنخفض',
      ORDER_PREFIX: 'بادئة رقم الطلب',
      TAX_RATE: 'نسبة الضريبة الافتراضية'
    };
    return descriptions[key] || key;
  }

  private getMockConfigs(): SystemConfiguration[] {
    return [
      { id: 1, key: 'MAX_LOGIN_ATTEMPTS', value: '5', category: ConfigCategory.Security, description: 'الحد الأقصى لمحاولات تسجيل الدخول قبل القفل', isEditable: true },
      { id: 2, key: 'SESSION_TIMEOUT', value: '30', category: ConfigCategory.Security, description: 'مهلة انتهاء الجلسة بالدقائق', isEditable: true },
      { id: 3, key: 'LOW_STOCK_THRESHOLD', value: '10', category: ConfigCategory.Inventory, description: 'حد التنبيه الافتراضي للمخزون المنخفض', isEditable: true },
      { id: 4, key: 'ORDER_PREFIX', value: 'ORD', category: ConfigCategory.Orders, description: 'بادئة رقم الطلب', isEditable: true },
      { id: 5, key: 'TAX_RATE', value: '15', category: ConfigCategory.Finance, description: 'نسبة ضريبة القيمة المضافة', isEditable: true }
    ];
  }
}
