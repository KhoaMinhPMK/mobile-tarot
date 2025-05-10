import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Matches, IsString, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf(o => !o.phoneNumber)
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Phải cung cấp email hoặc số điện thoại' })
  email?: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0987654321',
    required: false,
  })
  @ValidateIf(o => !o.email)
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 số' })
  @IsNotEmpty({ message: 'Phải cung cấp email hoặc số điện thoại' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}