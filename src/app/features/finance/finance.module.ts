import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FinanceRoutingModule } from './finance-routing.module';
import { FinanceComponent } from './finance.component';

@NgModule({
  declarations: [
    FinanceComponent
  ],
  imports: [
    SharedModule,
    FinanceRoutingModule
  ]
})
export class FinanceModule {}
