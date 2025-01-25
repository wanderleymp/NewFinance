import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingOrmEntity } from './infra/database/billing.entity.orm';
import { BillingRepository } from './infra/repositories/billing.repository';
import { ListPendingBillingsUseCase } from './domain/useCases/list-pending-billings.usecase';
import { BillingController } from './application/controllers/billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BillingOrmEntity])],
  controllers: [BillingController],
  providers: [
    BillingRepository,
    ListPendingBillingsUseCase,
    {
      provide: 'IBillingRepository',
      useClass: BillingRepository
    }
  ],
  exports: [ListPendingBillingsUseCase]
})
export class BillingModule {}
