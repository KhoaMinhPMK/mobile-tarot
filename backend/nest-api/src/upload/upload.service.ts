import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Tạo thư mục uploads nếu chưa tồn tại
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log('Đã tạo thư mục uploads');
    }
  }

  // Tạo URL cho file đã upload
  getFileUrl(filename: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }

  // Xóa file cũ (nếu cần)
  async removeOldAvatar(url: string): Promise<void> {
    // Implement logic để xóa avatar cũ từ URL nếu cần
  }
  
  // Cập nhật avatar của người dùng trong DB
  async updateUserAvatar(userId: number, avatarUrl: string): Promise<void> {
    this.logger.log(`Cập nhật avatar cho người dùng ${userId}: ${avatarUrl}`);
    await this.userRepository.update(userId, { avatar: avatarUrl });
  }
}
