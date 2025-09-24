import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  pair: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsIn(['BUY', 'SELL'])
  @IsNotEmpty()
  side: 'BUY' | 'SELL';
}
