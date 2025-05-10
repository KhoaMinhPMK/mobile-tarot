import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({
    description: 'Tổng số người dùng',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Số lượng admin',
    example: 5
  })
  admins: number;

  @ApiProperty({
    description: 'Số lượng người dùng thường',
    example: 95
  })
  users: number;
}