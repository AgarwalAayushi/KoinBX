import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBalanceDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  amount: string;
}
