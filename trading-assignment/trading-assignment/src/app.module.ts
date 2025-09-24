import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { BalancesModule } from './balances/balances.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [SharedModule, BalancesModule, OrdersModule],
})
export class AppModule {}
