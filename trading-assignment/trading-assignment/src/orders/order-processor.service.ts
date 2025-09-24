import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { OrdersService } from './orders.service';
import { BalancesService } from '../balances/balances.service';

@Injectable()
export class OrderProcessorService {
  private readonly logger = new Logger(OrderProcessorService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly balancesService: BalancesService,
  ) {}

  // Create order with balance check
  createOrder(userId: string, pair: string, price: Decimal, quantity: Decimal, side: 'BUY' | 'SELL') {
    const [baseCurrency, quoteCurrency] = pair.split('/');

    // 1️⃣ Check balance
    if (side === 'BUY') {
      const totalCost = price.mul(quantity);
      const balance = this.balancesService.getUserBalance(userId, quoteCurrency);

      if (balance.lt(totalCost)) {
        throw new BadRequestException(`Insufficient balance: ${balance.toString()} ${quoteCurrency} available, ${totalCost.toString()} needed`);
      }

      // Deduct quote currency
      this.balancesService.adjustUserBalance(userId, quoteCurrency, totalCost.negated());
    } else {
      const balance = this.balancesService.getUserBalance(userId, baseCurrency);
      if (balance.lt(quantity)) {
        throw new BadRequestException(`Insufficient balance: ${balance.toString()} ${baseCurrency} available, ${quantity.toString()} needed`);
      }

      // Deduct base currency
      this.balancesService.adjustUserBalance(userId, baseCurrency, quantity.negated());
    }

    // 2️⃣ Create order
    const order = this.ordersService.createOrder({ userId, pair, price, quantity, side });

    // 3️⃣ Process matching
    this.processOrders(pair);

    return order;
  }

  // Match orders and settle amounts
  processOrders(pair: string) {
    const openOrders = this.ordersService.getOpenOrders(pair);

    const buyOrders = openOrders
      .filter(o => o.side === 'BUY' && o.status === 'OPEN')
      .sort((a, b) => b.price.minus(a.price).toNumber());

    const sellOrders = openOrders
      .filter(o => o.side === 'SELL' && o.status === 'OPEN')
      .sort((a, b) => a.price.minus(b.price).toNumber());

    for (const buy of buyOrders) {
      for (const sell of sellOrders) {
        if (buy.status !== 'OPEN' || sell.status !== 'OPEN') continue;

        if (buy.price.greaterThanOrEqualTo(sell.price)) {
          const tradeQty = Decimal.min(buy.quantity, sell.quantity);

          // Credit buyer with base currency
          this.balancesService.adjustUserBalance(buy.userId, buy.pair.split('/')[0], tradeQty);

          // Credit seller with quote currency
          const tradeAmount = tradeQty.mul(sell.price);
          this.balancesService.adjustUserBalance(sell.userId, sell.pair.split('/')[1], tradeAmount);

          buy.quantity = buy.quantity.minus(tradeQty);
          sell.quantity = sell.quantity.minus(tradeQty);

          if (buy.quantity.equals(0)) buy.status = 'CLOSED';
          if (sell.quantity.equals(0)) sell.status = 'CLOSED';

          this.logger.log(`Matched BUY ${buy.id} with SELL ${sell.id} for qty ${tradeQty.toString()} at price ${sell.price.toString()}`);
        }
      }
    }
  }
}
