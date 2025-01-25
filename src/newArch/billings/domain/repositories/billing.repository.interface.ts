import { BillingEntity } from '../entities/billing.entity';

export interface IBillingRepository {
  findPendingBillings(): Promise<BillingEntity[]>;
  createBilling(billing: BillingEntity): Promise<BillingEntity>;
  updateBillingStatus(id: string, status: 'pending' | 'processed' | 'cancelled'): Promise<BillingEntity>;
}
