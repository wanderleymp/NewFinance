import { ContractEntity } from '../../contracts/domain/entities/contract.entity';

export class BillingEntity {
  id?: string;
  contract: ContractEntity;
  billingDate: Date;
  amount: number;
  status: 'pending' | 'processed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}
