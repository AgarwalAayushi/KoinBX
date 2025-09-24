import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

export type BalanceMap = Map<string, Decimal>;

@Injectable()
export class BalancesService {
  private balances: Map<string, BalanceMap> = new Map();

  createBalance(userId: string, currency: string, amount: Decimal) {
    const userBalances = this.balances.get(userId) ?? new Map<string, Decimal>();
    const prev = userBalances.get(currency) ?? new Decimal(0);
    userBalances.set(currency, prev.plus(amount));
    this.balances.set(userId, userBalances);
    return { userId, currency, amount: userBalances.get(currency)!.toString() };
  }

  getBalances(userId: string) {
    const userBalances = this.balances.get(userId) ?? new Map<string, Decimal>();
    const result: { currency: string; amount: string }[] = [];
    for (const [currency, amount] of userBalances.entries()) {
      result.push({ currency, amount: amount.toString() });
    }
    return result;
  }

  fetchUserBalance(userId: string, currency: string): Decimal | null {
    const userBalances = this.balances.get(userId);
    if (!userBalances) return null;
    return userBalances.get(currency) ?? null;
  }

  adjustUserBalance(userId: string, currency: string, delta: Decimal) {
    const userBalances = this.balances.get(userId) ?? new Map<string, Decimal>();
    const prev = userBalances.get(currency) ?? new Decimal(0);
    const next = prev.plus(delta);
    userBalances.set(currency, next);
    this.balances.set(userId, userBalances);
    return { userId, currency, amount: next.toString() };
  }

  getUserBalance(userId: string, currency: string): Decimal {
    return this.fetchUserBalance(userId, currency) ?? new Decimal(0);
  }
}
