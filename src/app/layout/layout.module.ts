import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { LayoutModule as CdkLayoutModule } from '@angular/cdk/layout';

import { MainLayoutComponent } from './main-layout/main-layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    SidebarComponent,
    NavbarComponent
  ],
  imports: [
    SharedModule,
    CdkLayoutModule
  ],
  exports: [
    MainLayoutComponent
  ]
})
export class LayoutModule {}
