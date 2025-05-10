import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
  HttpStatus,
  HttpCode,
  ForbiddenException,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Notification } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ===== ADMIN NOTIFICATION ENDPOINTS =====

  @ApiTags('admin')
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo thông báo mới cho người dùng' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Thông báo đã được tạo thành công',
    type: Notification,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng',
  })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  // ===== USER NOTIFICATION ENDPOINTS =====

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tất cả thông báo của người dùng đang đăng nhập' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về danh sách thông báo',
    type: [Notification],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  getMyNotifications(@Request() req) {
    return this.notificationService.findAllForUser(req.user.id);
  }

  @Get('me/unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc của người dùng đang đăng nhập' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về số lượng thông báo chưa đọc',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  countMyUnread(@Request() req) {
    return this.notificationService.countUnreadForUser(req.user.id);
  }

  @Patch('me/mark-all-read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo là đã đọc' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tất cả thông báo đã được đánh dấu là đã đọc',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tất cả thông báo của người dùng đang đăng nhập' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tất cả thông báo đã được xóa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  removeAllMyNotifications(@Request() req) {
    return this.notificationService.removeAllForUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông báo theo ID' })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về thông báo',
    type: Notification,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập thông báo này',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const notification = await this.notificationService.findOne(id);
    
    // Kiểm tra xem thông báo có thuộc về người dùng hiện tại không
    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập thông báo này');
    }
    
    return notification;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh dấu thông báo là đã đọc' })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông báo đã được cập nhật',
    type: Notification,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền cập nhật thông báo này',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Request() req
  ) {
    const notification = await this.notificationService.findOne(id);
    
    // Kiểm tra xem thông báo có thuộc về người dùng hiện tại không
    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền cập nhật thông báo này');
    }
    
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa thông báo theo ID' })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Thông báo đã được xóa',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xóa thông báo này',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const notification = await this.notificationService.findOne(id);
    
    // Kiểm tra xem thông báo có thuộc về người dùng hiện tại không
    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền xóa thông báo này');
    }
    
    return this.notificationService.remove(id);
  }
}