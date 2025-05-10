import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Email của admin (tùy chọn nếu cung cấp số điện thoại)',
    example: 'admin@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({
    description: 'Số điện thoại của admin (tùy chọn nếu cung cấp email)',
    example: '0987654321',
    required: false
  })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 số' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Mật khẩu của admin (bắt buộc khi tạo mới, tùy chọn khi nâng cấp)',
    minLength: 8,
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password?: string;

  @ApiProperty({
    description: 'Họ tên đầy đủ của admin',
    example: 'Admin User',
    required: false
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}