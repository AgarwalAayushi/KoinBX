import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { Order } from './order.entity';
import { InMemoryQueueService } from '../shared/in-memory-queue.service';
import { BalancesService } from '../balances/balances.service';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private idCounter = 1;

  constructor(private readonly queue: InMemoryQueueService) {}

  createOrder(orderData: Partial<Order>): Order {
    const order: Order = {
      id: this.idCounter++,
      userId: orderData.userId!,
      pair: orderData.pair!,
      price: new Decimal(orderData.price!),
      quantity: new Decimal(orderData.quantity!),
      side: orderData.side || 'BUY',
      status: 'OPEN',
      createdAt: Date.now(),
    };

    this.orders.push(order);

    // Push to in-memory queue
    this.queue.addMessage(JSON.stringify(order));

    return order;
  }

  getOpenOrders(pair?: string): Order[] {
    return this.orders.filter(o => o.status === 'OPEN' && (!pair || o.pair === pair));
  }

  cancelOrder(orderId: number, userId: string, balancesService: BalancesService): Order | null {
  const order = this.orders.find(o => o.id === orderId && o.userId === userId);
  if (order && order.status === 'OPEN') {
    order.status = 'CANCELLED';

    const [baseCurrency, quoteCurrency] = order.pair.split('/');

    if (order.side === 'BUY') {
      // Refund quote currency
      const refundAmount = order.price.mul(order.quantity);
      balancesService.adjustUserBalance(userId, quoteCurrency, refundAmount);
    } else {
      // Refund base currency
      balancesService.adjustUserBalance(userId, baseCurrency, order.quantity);
    }

    return order;
  }
  return null;
}

}
