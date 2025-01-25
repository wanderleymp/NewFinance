import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContractOrmEntity } from '../../../contracts/infra/database/contract.entity.orm';

@Entity('billings')
export class BillingOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ContractOrmEntity, contract => contract.billings)
  contract: ContractOrmEntity;

  @Column({ type: 'timestamp' })
  billingDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['pending', 'processed', 'cancelled'], default: 'pending' })
  status: 'pending' | 'processed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
