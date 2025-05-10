import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Tạo thông báo mới cho người dùng
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await this.userRepository.findOne({
      where: { id: createNotificationDto.userId },
    });
    
    if (!user) {
      this.logger.error(`User with ID ${createNotificationDto.userId} not found`);
      throw new NotFoundException(`User with ID ${createNotificationDto.userId} not found`);
    }
    
    const notification = this.notificationRepository.create({
      userId: createNotificationDto.userId,
      title: createNotificationDto.title,
      content: createNotificationDto.content,
      type: createNotificationDto.type || NotificationType.SYSTEM,
      isRead: false,
    });
    
    this.logger.log(`Creating notification for user ${createNotificationDto.userId}`);
    return this.notificationRepository.save(notification);
  }

  /**
   * Tạo thông báo khi điều chỉnh coin cho một người dùng
   */
  async createCoinNotification(userId: number, amount: number, note: string): Promise<Notification> {
    const isDeposit = amount > 0;
    
    const title = isDeposit 
      ? `Bạn đã nhận được ${amount} coin` 
      : `${Math.abs(amount)} coin đã bị trừ từ tài khoản của bạn`;
    
    const content = isDeposit
      ? `Admin đã thêm ${amount} coin vào tài khoản của bạn. Ghi chú: ${note}`
      : `Admin đã trừ ${Math.abs(amount)} coin từ tài khoản của bạn. Ghi chú: ${note}`;
    
    const notification = this.notificationRepository.create({
      userId,
      title,
      content,
      type: NotificationType.COIN,
      isRead: false,
    });
    
    this.logger.log(`Creating coin notification for user ${userId}`);
    return this.notificationRepository.save(notification);
  }

  /**
   * Lấy tất cả thông báo của một người dùng
   */
  async findAllForUser(userId: number): Promise<Notification[]> {
    this.logger.log(`Getting notifications for user ${userId}`);
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy số lượng thông báo chưa đọc của một người dùng
   */
  async countUnreadForUser(userId: number): Promise<number> {
    this.logger.log(`Counting unread notifications for user ${userId}`);
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Lấy một thông báo cụ thể theo ID
   */
  async findOne(id: number): Promise<Notification> {
    this.logger.log(`Getting notification with ID ${id}`);
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    
    if (!notification) {
      this.logger.error(`Notification with ID ${id} not found`);
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    return notification;
  }

  /**
   * Cập nhật trạng thái đã đọc của một thông báo
   */
  async update(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    this.logger.log(`Updating notification with ID ${id}`);
    
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    
    if (!notification) {
      this.logger.error(`Notification with ID ${id} not found`);
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    
    // Chỉ cho phép cập nhật trạng thái đã đọc
    if (updateNotificationDto.isRead !== undefined) {
      notification.isRead = updateNotificationDto.isRead;
    }
    
    return this.notificationRepository.save(notification);
  }

  /**
   * Đánh dấu tất cả thông báo của một người dùng là đã đọc
   */
  async markAllAsRead(userId: number): Promise<void> {
    this.logger.log(`Marking all notifications as read for user ${userId}`);
    
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('user_id = :userId AND is_read = :isRead', { userId, isRead: false })
      .execute();
  }

  /**
   * Xóa một thông báo cụ thể
   */
  async remove(id: number): Promise<void> {
    this.logger.log(`Removing notification with ID ${id}`);
    
    const result = await this.notificationRepository.delete(id);
    
    if (result.affected === 0) {
      this.logger.error(`Notification with ID ${id} not found`);
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  /**
   * Xóa tất cả thông báo của một người dùng
   */
  async removeAllForUser(userId: number): Promise<void> {
    this.logger.log(`Removing all notifications for user ${userId}`);
    
    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('user_id = :userId', { userId })
      .execute();
  }
}