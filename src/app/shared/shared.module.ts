import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TruncatePipe } from './pipes/truncate.pipe';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';

import { HasRoleDirective } from './directives/has-role.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';

import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatSnackBarModule,
  MatMenuModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatCardModule,
  MatTabsModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatChipsModule,
  MatBadgeModule,
  MatTooltipModule,
  MatDividerModule,
  MatAutocompleteModule,
  MatSlideToggleModule
];

const PIPES = [
  TruncatePipe,
  DateAgoPipe,
  CurrencyFormatPipe
];

const DIRECTIVES = [
  HasRoleDirective,
  ClickOutsideDirective
];

const COMPONENTS = [
  LoadingSpinnerComponent,
  ConfirmDialogComponent,
  PageHeaderComponent,
  DataTableComponent,
  EmptyStateComponent
];

@NgModule({
  declarations: [
    ...PIPES,
    ...DIRECTIVES,
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...MATERIAL_MODULES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...MATERIAL_MODULES,
    ...PIPES,
    ...DIRECTIVES,
    ...COMPONENTS
  ]
})
export class SharedModule {}
