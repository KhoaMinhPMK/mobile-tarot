import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpException
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { AdjustCoinDto } from './dto/adjust-coin.dto';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserSimpleDto } from './dto/update-user-simple.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ===== USER ENDPOINTS =====

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Trả về danh sách người dùng',
    type: [User]
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của người dùng đang đăng nhập' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Trả về thông tin người dùng',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  async getProfile(@Request() req) {
    return this.userService.findOneWithCoins(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Trả về thống kê người dùng',
    type: UserStatsDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  async getUserStats(@Request() req) {
    console.log(`Đang lấy thống kê người dùng cho user ID: ${req.user.id}, role: ${req.user.role}`);
    return this.userService.getUserStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('phone/:phoneNumber')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm người dùng theo số điện thoại' })
  @ApiParam({ name: 'phoneNumber', type: 'string', description: 'Số điện thoại người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Trả về thông tin người dùng',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy người dùng.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  async findByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    // Đảm bảo phoneNumber không undefined trước khi truyền vào service
    if (!phoneNumber) {
      throw new HttpException('Số điện thoại không được để trống', HttpStatus.BAD_REQUEST);
    }
    
    const user = await this.userService.findByPhoneNumber(phoneNumber);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Trả về thông tin người dùng',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy người dùng.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân của người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Thông tin cá nhân đã được cập nhật thành công.',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy người dùng.' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email đã tồn tại.' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dữ liệu không hợp lệ hoặc không thể thay đổi email khi chưa có số điện thoại.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req
  ) {
    return this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa người dùng' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID người dùng' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Người dùng đã được xóa thành công.' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy người dùng.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Không có quyền xóa người dùng khác.' 
  })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Chỉ cho phép người dùng xóa tài khoản của chính họ
    if (req.user.id !== id) {
      throw new HttpException('Bạn không có quyền xóa tài khoản của người dùng khác', HttpStatus.FORBIDDEN);
    }
    return this.userService.remove(id);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đặt lại mật khẩu người dùng' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Mật khẩu đã được đặt lại thành công.' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy người dùng với email hoặc số điện thoại này.' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dữ liệu đầu vào không hợp lệ.' 
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.userService.resetPassword(resetPasswordDto);
  }

  // ===== WALLET ENDPOINTS =====

  @ApiTags('coin')
  @Get('me/coins/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch coin của người dùng đang đăng nhập' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về lịch sử giao dịch coin của người dùng đang đăng nhập',
    type: [CoinTransaction]
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  async getMyTransactions(@Request() req) {
    return this.userService.getUserCoinTransactions(req.user.id);
  }

  // ===== ADMIN USER ENDPOINTS =====

  @ApiTags('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa người dùng bất kỳ' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID người dùng' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Người dùng đã được xóa thành công.' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy người dùng.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Không có quyền admin.' 
  })
  async adminRemoveUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.adminRemoveUser(id);
  }

  @ApiTags('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/:id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật vai trò người dùng' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Vai trò người dùng đã được cập nhật thành công.',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy người dùng.' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dữ liệu không hợp lệ.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Không có quyền admin.' 
  })
  async adminUpdateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.userService.adminUpdateUserRole(id, updateRoleDto.role);
  }

  @ApiTags('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/create-admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo hoặc nâng cấp tài khoản admin' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Tài khoản admin đã được tạo hoặc nâng cấp thành công.',
    type: User
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dữ liệu không hợp lệ hoặc thiếu thông tin cần thiết.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Không được phép truy cập.' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Không có quyền admin.' 
  })
  async createOrPromoteAdmin(@Body() createAdminDto: CreateAdminDto) {
    if (!createAdminDto.email && !createAdminDto.phoneNumber) {
      throw new HttpException('Phải cung cấp ít nhất một trong email hoặc số điện thoại', HttpStatus.BAD_REQUEST);
    }

    // Cast to string explicitly to handle TypeScript error
    const email: string = createAdminDto.email || '';
    const phoneNumber: string = createAdminDto.phoneNumber || '';
    const password: string = createAdminDto.password || '';

    return this.userService.createOrPromoteAdmin(
      email,
      phoneNumber,
      password
    );
  }

  // ===== ADMIN WALLET ENDPOINTS =====

  @ApiTags('admin-coin')
  @Patch('admin/:id/coins')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Điều chỉnh coin cho người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiBody({ type: AdjustCoinDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về thông tin người dùng sau khi điều chỉnh coin',
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
  async adjustUserCoins(
    @Param('id') id: string,
    @Body() adjustCoinDto: AdjustCoinDto,
    @Request() req
  ) {
    return this.userService.adjustUserCoins(+id, adjustCoinDto, req.user.id);
  }

  @ApiTags('admin-coin')
  @Get('admin/:id/coins/transactions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy lịch sử giao dịch coin của một người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về lịch sử giao dịch coin của người dùng',
    type: [CoinTransaction]
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
  async getUserTransactions(@Param('id') id: string) {
    return this.userService.getUserCoinTransactions(+id);
  }

  @ApiTags('admin-coin')
  @Get('admin/stats/coins')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thống kê tổng số coin trong hệ thống' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về thống kê tổng số coin trong hệ thống',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Không có quyền truy cập',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền admin',
  })
  async getTotalCoins() {
    return this.userService.getTotalSystemCoins();
  }
}