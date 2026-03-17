import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { InventoryFormComponent } from './inventory-form/inventory-form.component';

@NgModule({
  declarations: [
    InventoryListComponent,
    InventoryFormComponent
  ],
  imports: [
    SharedModule,
    InventoryRoutingModule
  ]
})
export class InventoryModule {}
