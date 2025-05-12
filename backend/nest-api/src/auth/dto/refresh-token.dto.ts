import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token dùng để làm mới access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  @IsString({ message: 'Refresh token phải là chuỗi' })
  refreshToken: string;
}
