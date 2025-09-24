import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BalancesService } from './balances.service';
import Decimal from 'decimal.js';
import { CreateBalanceDto } from './dto/create-balance.dto';

@Controller('balance')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Post('create')
  create(@Body() dto: CreateBalanceDto) {
    const amount = new Decimal(dto.amount);
    return this.balancesService.createBalance(dto.userId, dto.currency, amount);
  }

  @Get(':userId')
  getUserBalances(@Param('userId') userId: string) {
    return this.balancesService.getBalances(userId);
  }
}
