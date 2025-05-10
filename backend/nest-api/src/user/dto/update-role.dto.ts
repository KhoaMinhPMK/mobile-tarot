import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Vai trò mới của người dùng',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsEnum(UserRole, { message: 'Vai trò phải là một trong các giá trị: user, admin' })
  role: UserRole;
}