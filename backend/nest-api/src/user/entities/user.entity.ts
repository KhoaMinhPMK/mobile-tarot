import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Matches, MinLength } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User full name', example: 'John Doe', nullable: true })
  @Column({ name: 'full_name', type: 'varchar', nullable: true })
  @IsOptional()
  fullName: string;

  @ApiProperty({ description: 'User phone number', example: '0987654321', nullable: true })
  @Column({ name: 'phone_number', type: 'varchar', unique: true, nullable: true })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 số' })
  phoneNumber: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com', nullable: true })
  @Column({ type: 'varchar', unique: true, nullable: true })
  @IsOptional()
  @IsEmail({})
  email: string;

  @ApiProperty({ description: 'User password (hashed)', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    description: 'User date of birth', 
    example: '1990-01-01',
    type: Date,
    nullable: true
  })
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @ApiProperty({ 
    description: 'User gender', 
    enum: Gender,
    example: Gender.MALE,
    nullable: true 
  })
  @Column({ 
    name: 'gender',
    type: 'varchar', 
    enum: Gender, 
    default: Gender.OTHER,
    nullable: true
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'User avatar URL', example: 'https://example.com/avatar.jpg', nullable: true })
  @Column({ name: 'avatar', type: 'varchar', nullable: true })
  @IsOptional()
  avatar: string;

  @ApiProperty({ description: 'Authentication provider', enum: AuthProvider, default: AuthProvider.LOCAL })
  @Column({ 
    name: 'auth_provider',
    type: 'varchar',
    enum: AuthProvider, 
    default: AuthProvider.LOCAL 
  })
  authProvider: AuthProvider;

  @ApiProperty({ 
    description: 'User role', 
    enum: UserRole,
    example: UserRole.USER,
    default: UserRole.USER 
  })
  @Column({ 
    name: 'role',
    type: 'varchar',
    enum: UserRole, 
    default: UserRole.USER 
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'User address', example: 'Hà Nội, Việt Nam', nullable: true })
  @Column({ name: 'address', type: 'varchar', nullable: true })
  @IsOptional()
  address: string;

  @ApiProperty({ description: 'User coin balance', example: 0, default: 0 })
  @Column({ name: 'coin_balance', type: 'integer', default: 0 })
  coinBalance: number;

  @ApiProperty({ description: 'User refresh token for authentication', nullable: true })
  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken: string;

  @ApiProperty({ description: 'When the user was created', type: Date })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'When the user was last updated', type: Date })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  checkRequiredFields() {
    if (!this.email && !this.phoneNumber) {
      throw new BadRequestException('Phải cung cấp ít nhất một trong email hoặc số điện thoại');
    }
  }
}