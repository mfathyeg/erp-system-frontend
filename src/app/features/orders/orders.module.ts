import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

@NgModule({
  declarations: [
    OrderListComponent,
    OrderDetailsComponent
  ],
  imports: [
    SharedModule,
    OrdersRoutingModule
  ]
})
export class OrdersModule {}
