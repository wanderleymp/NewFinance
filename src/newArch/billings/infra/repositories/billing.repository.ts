import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBillingRepository } from '../../domain/repositories/billing.repository.interface';
import { BillingEntity } from '../../domain/entities/billing.entity';
import { BillingOrmEntity } from '../database/billing.entity.orm';

@Injectable()
export class BillingRepository implements IBillingRepository {
  constructor(
    @InjectRepository(BillingOrmEntity)
    private billingRepository: Repository<BillingOrmEntity>
  ) {}

  async findPendingBillings(): Promise<BillingEntity[]> {
    const billings = await this.billingRepository.find({
      where: { status: 'pending' },
      relations: ['contract']
    });
    return billings.map(billing => ({
      id: billing.id,
      contract: billing.contract,
      billingDate: billing.billingDate,
      amount: billing.amount,
      status: billing.status
    }));
  }

  async createBilling(billing: BillingEntity): Promise<BillingEntity> {
    const newBilling = this.billingRepository.create(billing);
    await this.billingRepository.save(newBilling);
    return newBilling;
  }

  async updateBillingStatus(id: string, status: 'pending' | 'processed' | 'cancelled'): Promise<BillingEntity> {
    await this.billingRepository.update(id, { status });
    const updatedBilling = await this.billingRepository.findOne({ where: { id } });
    return updatedBilling;
  }
}
