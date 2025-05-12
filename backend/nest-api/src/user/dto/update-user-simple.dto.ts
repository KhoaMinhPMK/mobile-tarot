import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../entities/user.entity';

export class UpdateUserSimpleDto {
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
    description: 'Address of the user',
    example: 'Hà Nội, Việt Nam',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;
} 