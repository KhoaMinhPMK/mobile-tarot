import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Đánh dấu thông báo đã đọc',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}