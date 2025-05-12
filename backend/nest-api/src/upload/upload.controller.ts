import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload hình ảnh (API cũ)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File hình ảnh',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Upload thành công, trả về URL của hình ảnh',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'http://localhost:3000/uploads/image-123456.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      this.logger.warn('Không tìm thấy file trong request');
      throw new BadRequestException('Vui lòng tải lên một file hình ảnh');
    }

    this.logger.log(`Người dùng ${req.user.id} đã upload hình ảnh (API cũ): ${file.filename}`);

    const url = this.uploadService.getFileUrl(file.filename);
    
    // Cập nhật avatar vào thông tin người dùng
    await this.uploadService.updateUserAvatar(req.user.id, url);
    
    return { url };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload avatar cho người dùng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File avatar',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Upload thành công, trả về URL của avatar',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'http://localhost:3000/uploads/avatar-123456.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      this.logger.warn('Không tìm thấy file trong request');
      throw new BadRequestException('Vui lòng tải lên một file hình ảnh');
    }

    this.logger.log(`Người dùng ${req.user.id} đã upload avatar: ${file.filename}`);

    const url = this.uploadService.getFileUrl(file.filename);
    
    // Cập nhật avatar vào thông tin người dùng
    await this.uploadService.updateUserAvatar(req.user.id, url);
    
    return { url };
  }
}
