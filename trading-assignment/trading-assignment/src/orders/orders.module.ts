import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderProcessorService } from './order-processor.service';
import { SharedModule } from '../shared/shared.module';
import { BalancesModule } from '../balances/balances.module';

@Module({
  imports: [BalancesModule, SharedModule],
  providers: [OrdersService, OrderProcessorService],
  controllers: [OrdersController],
})
export class OrdersModule {}
