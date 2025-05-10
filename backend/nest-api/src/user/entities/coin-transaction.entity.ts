import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

@Entity('coin_transactions')
export class CoinTransaction {
  @ApiProperty({ description: 'Transaction ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID', example: 1 })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: 'Amount of coins', example: 100 })
  @Column({ name: 'amount', type: 'integer' })
  amount: number;

  @ApiProperty({ 
    description: 'Transaction type', 
    enum: TransactionType,
    example: TransactionType.DEPOSIT 
  })
  @Column({ 
    name: 'type',
    type: 'varchar',
    enum: TransactionType
  })
  type: TransactionType;

  @ApiProperty({ description: 'Note about the transaction', example: 'Reward for completing profile' })
  @Column({ name: 'note', type: 'varchar', nullable: true })
  note: string;

  @ApiProperty({ description: 'Admin who performed the transaction', example: 'admin@example.com', nullable: true })
  @Column({ name: 'performed_by', type: 'varchar', nullable: true })
  performedBy: string;

  @ApiProperty({ description: 'When the transaction was created', type: Date })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}