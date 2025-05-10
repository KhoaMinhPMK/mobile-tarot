import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  SYSTEM = 'system',
  COIN = 'coin',
  USER = 'user',
  ANNOUNCEMENT = 'announcement',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: 'Notification ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID', example: 1 })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: 'Notification title', example: 'Coin received' })
  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @ApiProperty({ description: 'Notification content', example: 'You have received 100 coins!' })
  @Column({ name: 'content', type: 'text' })
  content: string;

  @ApiProperty({ 
    description: 'Notification type', 
    enum: NotificationType,
    example: NotificationType.COIN 
  })
  @Column({ 
    name: 'type',
    type: 'varchar',
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @ApiProperty({ description: 'Whether the notification has been read', example: false })
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @ApiProperty({ description: 'When the notification was created', type: Date })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}