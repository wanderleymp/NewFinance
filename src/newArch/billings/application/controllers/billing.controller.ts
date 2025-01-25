import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ListPendingBillingsUseCase } from '../domain/useCases/list-pending-billings.usecase';
import { BillingResponseDto } from './dto/billing-response.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Billings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts-recurring')
export class BillingController {
  constructor(private listPendingBillingsUseCase: ListPendingBillingsUseCase) {}

  @Get('pending-billings')
  async getPendingBillings(): Promise<BillingResponseDto[]> {
    const billings = await this.listPendingBillingsUseCase.execute();
    return billings.map(billing => ({
      id: billing.id,
      contractId: billing.contract.id,
      billingDate: billing.billingDate,
      amount: billing.amount,
      status: billing.status
    }));
  }
}
