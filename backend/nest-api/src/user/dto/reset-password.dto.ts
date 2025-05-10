import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Matches, IsString, MinLength, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Email của người dùng', 
    example: 'user@example.com',
    required: false
  })
  @ValidateIf(o => !o.phoneNumber)
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email hoặc số điện thoại là bắt buộc' })
  email?: string;

  @ApiProperty({ 
    description: 'Số điện thoại của người dùng', 
    example: '0987654321',
    required: false 
  })
  @ValidateIf(o => !o.email)
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 số' })
  @IsNotEmpty({ message: 'Email hoặc số điện thoại là bắt buộc' })
  phoneNumber?: string;

  @ApiProperty({ description: 'Mật khẩu mới', example: 'newPassword123' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  newPassword: string;
}