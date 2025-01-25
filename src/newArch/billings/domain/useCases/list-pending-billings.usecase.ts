import { Injectable } from '@nestjs/common';
import { IBillingRepository } from '../repositories/billing.repository.interface';
import { BillingEntity } from '../entities/billing.entity';

@Injectable()
export class ListPendingBillingsUseCase {
  constructor(private billingRepository: IBillingRepository) {}

  async execute(): Promise<BillingEntity[]> {
    return this.billingRepository.findPendingBillings();
  }
}
