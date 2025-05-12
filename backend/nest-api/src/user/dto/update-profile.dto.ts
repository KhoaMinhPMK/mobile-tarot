import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsISO8601, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Gender } from '../entities/user.entity';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({
    description: 'The date of birth of the user',
    example: '1990-01-01',
    required: false
  })
  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'The gender of the user',
    enum: Gender,
    example: Gender.MALE,
    required: false
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính phải là male, female hoặc other' })
  gender?: Gender;
    @ApiProperty({
    description: 'Avatar URL of the user',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Alternative Avatar URL field (alias for avatar)',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Address of the user',
    example: 'Hà Nội, Việt Nam',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Old password for verification when changing password',
    example: 'OldPassword123',
    required: false
  })
  @IsOptional()
  @IsString()
  oldPassword?: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword123',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  newPassword?: string;
}