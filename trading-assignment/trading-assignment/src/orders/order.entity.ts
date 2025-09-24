import Decimal from 'decimal.js';

export type OrderStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type OrderSide = 'BUY' | 'SELL';

export class Order {
  id: number;
  userId: string;
  pair: string;
  price: Decimal;
  quantity: Decimal;
  status: OrderStatus;
  side: OrderSide;
  createdAt: number;
}
