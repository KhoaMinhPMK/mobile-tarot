import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsISO8601, IsNotEmpty, IsOptional, Matches, IsString, MinLength, ValidateIf } from 'class-validator';
import { AuthProvider, Gender } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '0987654321',
    required: false,
  })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 số' })
  @ValidateIf((o) => !o.email || o.phoneNumber)
  phoneNumber?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @ValidateIf((o) => !o.phoneNumber || o.email)
  email?: string;

  @ApiProperty({
    description: 'The user password',
    example: 'StrongPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @ValidateIf((o) => o.authProvider !== 'google')
  password?: string;

  @ApiProperty({
    description: 'The date of birth of the user',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'The gender of the user',
    enum: Gender,
    example: Gender.MALE,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính phải là male, female hoặc other' })
  gender?: Gender;

  @ApiProperty({
    description: 'The authentication provider',
    enum: AuthProvider,
    example: AuthProvider.LOCAL,
    default: AuthProvider.LOCAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider = AuthProvider.LOCAL;
}