import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate } from 'class-validator';

export class BillingResponseDto {
  @ApiProperty({ description: 'ID da fatura' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'ID do contrato' })
  @IsString()
  contractId: string;

  @ApiProperty({ description: 'Data de faturamento' })
  @IsDate()
  billingDate: Date;

  @ApiProperty({ description: 'Valor da fatura' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Status da fatura', enum: ['pending', 'processed', 'cancelled'] })
  @IsString()
  status: 'pending' | 'processed' | 'cancelled';
}
