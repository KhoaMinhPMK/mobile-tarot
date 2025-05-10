import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class AdjustCoinDto {
  @ApiProperty({ description: 'Amount of coins to adjust. Positive for deposit, negative for withdraw.', example: 100 })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  amount: number;

  @ApiProperty({ description: 'Note about the transaction', example: 'Reward for completing profile' })
  @IsNotEmpty({ message: 'Ghi chú không được để trống' })
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MinLength(3, { message: 'Ghi chú phải có ít nhất 3 ký tự' })
  note: string;
}