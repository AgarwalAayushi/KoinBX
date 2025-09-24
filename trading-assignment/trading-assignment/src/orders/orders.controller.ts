import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrdersService } from './orders.service';
import { OrderProcessorService } from './order-processor.service';
import Decimal from 'decimal.js';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly processor: OrderProcessorService,
  ) { }

  @Post('create')
  createOrder(@Body() dto: CreateOrderDto) {
    const order = this.processor.createOrder(
      dto.userId,
      dto.pair,
      new Decimal(dto.price),
      new Decimal(dto.quantity),
      dto.side
    );
    return order;
  }

  @Post('cancel')
  cancelOrder(@Body() dto: CancelOrderDto) {
    const orderId = parseInt(dto.orderId);
    const cancelled = this.ordersService.cancelOrder(orderId, dto.userId, this.processor['balancesService']);
    return cancelled ? { ok: true, order: cancelled } : { ok: false, message: 'Cannot cancel' };
  }


  @Post('open')
  getOpenOrders(@Body('pair') pair: string) {
    return this.ordersService.getOpenOrders(pair);
  }
}
