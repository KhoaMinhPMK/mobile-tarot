import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID của người nhận thông báo',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Bạn đã nhận được 100 coin'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Admin đã thêm 100 coin vào tài khoản của bạn!'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Loại thông báo',
    enum: NotificationType,
    example: NotificationType.COIN
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}