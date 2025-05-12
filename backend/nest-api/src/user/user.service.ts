import { Injectable, ConflictException, NotFoundException, Logger, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdjustCoinDto } from './dto/adjust-coin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, AuthProvider, UserRole } from './entities/user.entity';
import { CoinTransaction, TransactionType } from './entities/coin-transaction.entity';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { NotificationService } from '../notification/notification.service';
import { UpdateUserSimpleDto } from './dto/update-user-simple.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger,
    private dataSource: DataSource,
    private notificationService: NotificationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Tạo người dùng mới với phương thức: ${createUserDto.authProvider}`);
    
    // Kiểm tra xem có cung cấp email hoặc số điện thoại không
    if (!createUserDto.email && !createUserDto.phoneNumber) {
      this.logger.warn('Không thể tạo người dùng: thiếu email hoặc số điện thoại');
      throw new BadRequestException('Phải cung cấp ít nhất một trong email hoặc số điện thoại');
    }

    // Kiểm tra số điện thoại nếu được cung cấp
    if (createUserDto.phoneNumber) {
      const existingPhone = await this.userRepository.findOne({
        where: { phoneNumber: createUserDto.phoneNumber },
      });
      
      if (existingPhone) {
        this.logger.warn(`Số điện thoại đã tồn tại: ${createUserDto.phoneNumber}`);
        throw new ConflictException('Số điện thoại này đã được đăng ký');
      }
    }

    // Kiểm tra email nếu được cung cấp
    if (createUserDto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      
      if (existingEmail) {
        this.logger.warn(`Email đã tồn tại: ${createUserDto.email}`);
        throw new ConflictException('Email này đã được đăng ký');
      }
    }

    try {
      // Tạo đối tượng người dùng mới
      const userData: Partial<User> = {
        authProvider: createUserDto.authProvider || AuthProvider.LOCAL,
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        phoneNumber: createUserDto.phoneNumber,
        gender: createUserDto.gender,
      };
      
      // Hash mật khẩu nếu được cung cấp và không phải đăng ký với Google
      if (createUserDto.password && createUserDto.authProvider !== AuthProvider.GOOGLE) {
        userData.password = await bcrypt.hash(createUserDto.password, 10);
      }
      
      // Xử lý ngày sinh nếu được cung cấp
      if (createUserDto.dateOfBirth) {
        userData.dateOfBirth = new Date(createUserDto.dateOfBirth);
      }
      
      const user = this.userRepository.create(userData);
      
      // Lưu và trả về người dùng
      const savedUser = await this.userRepository.save(user);
      
      // Log thông tin dựa trên phương thức đăng ký
      if (savedUser.authProvider === AuthProvider.GOOGLE) {
        this.winstonLogger.log({
          level: 'info',
          message: `Người dùng đã tạo thành công với Google, email: ${savedUser.email}, ID: ${savedUser.id}`
        });
      } else {
        this.winstonLogger.log({
          level: 'info',
          message: `Người dùng đã tạo thành công với phương thức thông thường, ID: ${savedUser.id}`
        });
      }
      
      // Loại bỏ thông tin nhạy cảm trước khi trả về
      const { password, ...result } = savedUser;
      return result as User;
    } catch (error) {
      this.winstonLogger.error({
        level: 'error',
        message: `Lỗi khi tạo người dùng: ${error.message}`,
        trace: error.stack
      });
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    try {
      const users = await this.userRepository.find();
      return users.map(user => {
        const { password, ...result } = user;
        return result as User;
      });
    } catch (error) {
      this.winstonLogger.error({
        level: 'error',
        message: `Error fetching users: ${error.message}`,
        trace: error.stack
      });
      throw error;
    }
  }

  async findOne(id: number): Promise<User> {
    this.logger.log(`Finding user by ID: ${id}`);
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      const { password, ...result } = user;
      return result as User;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Error finding user by ID: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  async findOneWithCoins(id: number): Promise<User> {
    this.logger.log(`Finding user by ID with coins info: ${id}`);
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      
      if (!user) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      const { password, ...result } = user;
      return result as User;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Error finding user by ID with coins: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding user by email: ${email}`);
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      
      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        throw new NotFoundException(`User with email ${email} not found`);
      }
      
      return user;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Error finding user by email: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    this.logger.log(`Finding user by phone number: ${phoneNumber}`);
    try {
      const user = await this.userRepository.findOne({ where: { phoneNumber } });
      
      if (!user) {
        this.logger.warn(`User not found with phone number: ${phoneNumber}`);
        throw new NotFoundException(`User with phone number ${phoneNumber} not found`);
      }
      
      return user;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Error finding user by phone number: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        this.logger.warn(`Attempted to update non-existent user with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // If email is being updated, check for duplicates
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const emailExists = await this.userRepository.findOne({ 
          where: { email: updateUserDto.email } 
        });
        
        if (emailExists) {
          this.logger.warn(`Attempted to update user to an existing email: ${updateUserDto.email}`);
          throw new ConflictException('User with this email already exists');
        }
      }

      // If phone is being updated, check for duplicates
      if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== user.phoneNumber) {
        const phoneExists = await this.userRepository.findOne({ 
          where: { phoneNumber: updateUserDto.phoneNumber } 
        });
        
        if (phoneExists) {
          this.logger.warn(`Attempted to update user to an existing phone number: ${updateUserDto.phoneNumber}`);
          throw new ConflictException('User with this phone number already exists');
        }
      }

      // Create an object for the updates
      const updatedUserData: Partial<User> = {};
      
      // Copy all fields from the DTO to the update object
      if (updateUserDto.fullName !== undefined) updatedUserData.fullName = updateUserDto.fullName;
      if (updateUserDto.email !== undefined) updatedUserData.email = updateUserDto.email;
      if (updateUserDto.phoneNumber !== undefined) updatedUserData.phoneNumber = updateUserDto.phoneNumber;
      if (updateUserDto.gender !== undefined) updatedUserData.gender = updateUserDto.gender;
      
      // Handle date of birth conversion properly
      if (updateUserDto.dateOfBirth !== undefined) {
        updatedUserData.dateOfBirth = new Date(updateUserDto.dateOfBirth);
      }
      
      // Hash the password if it's being updated
      if (updateUserDto.password) {
        updatedUserData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      await this.userRepository.update(id, updatedUserData);
      
      this.winstonLogger.log({
        level: 'info',
        message: `User updated successfully: ${id}`
      });
      return this.findOne(id);
    } catch (error) {
      if (!(error instanceof NotFoundException) && !(error instanceof ConflictException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Error updating user: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing user with ID: ${id}`);
    try {
      const result = await this.userRepository.delete(id);
      
      if (result.affected === 0) {
        this.logger.warn(`Attempted to remove non-existent user with ID: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      this.winstonLogger.log({
        level: 'info',
        message: `User removed successfully: ${id}`
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Error removing user: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  async setRefreshToken(userId: number, refreshToken: string | undefined): Promise<void> {
    this.logger.log(`Setting refresh token for user with ID: ${userId}`);
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        this.logger.warn(`Attempted to set refresh token for non-existent user with ID: ${userId}`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Use undefined instead of null to satisfy TypeORM's type constraints
      await this.userRepository.update(userId, { refreshToken: refreshToken });
      this.winstonLogger.log({
        level: 'info',
        message: `Refresh token updated for user: ${userId}`
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Error setting refresh token: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    this.logger.log(`Đang tiến hành đặt lại mật khẩu`);
    
    try {
      let user: User | null = null;
      
      // Tìm người dùng theo email hoặc số điện thoại
      if (resetPasswordDto.email) {
        this.logger.log(`Tìm kiếm người dùng theo email: ${resetPasswordDto.email}`);
        user = await this.userRepository.findOne({ 
          where: { email: resetPasswordDto.email } 
        });
        
        if (!user) {
          this.logger.warn(`Không tìm thấy người dùng với email: ${resetPasswordDto.email}`);
          throw new NotFoundException(`Người dùng với email ${resetPasswordDto.email} không tồn tại`);
        }
      } else if (resetPasswordDto.phoneNumber) {
        this.logger.log(`Tìm kiếm người dùng theo số điện thoại: ${resetPasswordDto.phoneNumber}`);
        user = await this.userRepository.findOne({ 
          where: { phoneNumber: resetPasswordDto.phoneNumber } 
        });
        
        if (!user) {
          this.logger.warn(`Không tìm thấy người dùng với số điện thoại: ${resetPasswordDto.phoneNumber}`);
          throw new NotFoundException(`Người dùng với số điện thoại ${resetPasswordDto.phoneNumber} không tồn tại`);
        }
      } else {
        this.logger.warn('Yêu cầu đặt lại mật khẩu không cung cấp email hoặc số điện thoại');
        throw new NotFoundException(`Yêu cầu phải cung cấp email hoặc số điện thoại`);
      }
      
      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
      
      // Cập nhật mật khẩu
      await this.userRepository.update(user.id, { password: hashedPassword });
      
      this.winstonLogger.log({
        level: 'info',
        message: `Mật khẩu đã được đặt lại thành công cho người dùng: ${user.id}`
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Lỗi khi đặt lại mật khẩu: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  // Admin: Xóa người dùng bất kỳ bởi admin
  async adminRemoveUser(id: number): Promise<void> {
    this.logger.log(`[ADMIN] Đang xóa người dùng với ID: ${id}`);
    
    // Sử dụng transaction để đảm bảo tính nhất quán dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Kiểm tra xem người dùng có tồn tại không
      const user = await queryRunner.manager.findOne(User, { where: { id } });
      
      if (!user) {
        this.logger.warn(`[ADMIN] Cố gắng xóa người dùng không tồn tại với ID: ${id}`);
        throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
      }
      
      // Xóa tất cả giao dịch coin của người dùng trước
      this.logger.log(`[ADMIN] Đang xóa tất cả giao dịch coin của người dùng ID: ${id}`);
      await queryRunner.manager.delete(CoinTransaction, { userId: id });
      
      // Sau đó xóa người dùng
      await queryRunner.manager.delete(User, id);
      
      // Commit transaction nếu thành công
      await queryRunner.commitTransaction();
      
      this.winstonLogger.log({
        level: 'info',
        message: `[ADMIN] Người dùng đã được xóa thành công: ${id}`
      });
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `[ADMIN] Lỗi khi xóa người dùng: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    } finally {
      // Giải phóng query runner
      await queryRunner.release();
    }
  }

  // Admin: Cập nhật vai trò người dùng
  async adminUpdateUserRole(id: number, role: UserRole): Promise<User> {
    this.logger.log(`[ADMIN] Cập nhật vai trò người dùng với ID: ${id} thành ${role}`);
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        this.logger.warn(`[ADMIN] Cố gắng cập nhật người dùng không tồn tại với ID: ${id}`);
        throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
      }

      await this.userRepository.update(id, { role });
      
      this.winstonLogger.log({
        level: 'info',
        message: `[ADMIN] Vai trò người dùng đã được cập nhật thành công, ID: ${id}, Vai trò mới: ${role}`
      });

      return this.findOne(id);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `[ADMIN] Lỗi khi cập nhật vai trò người dùng: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  // Admin: Tạo tài khoản admin mới hoặc nâng cấp tài khoản hiện có thành admin
  async createOrPromoteAdmin(email: string, phoneNumber: string, password: string): Promise<User> {
    this.logger.log(`[ADMIN] Đang tạo/nâng cấp tài khoản admin với email: ${email} hoặc số điện thoại: ${phoneNumber}`);
    
    try {
      // Kiểm tra xem người dùng đã tồn tại chưa
      let user: User | null = null;
      
      if (email) {
        user = await this.userRepository.findOne({ where: { email } }).catch(() => null);
      }
      
      if (!user && phoneNumber) {
        user = await this.userRepository.findOne({ where: { phoneNumber } }).catch(() => null);
      }
      
      if (user) {
        // Nếu người dùng đã tồn tại, nâng cấp thành admin
        user.role = UserRole.ADMIN;
        
        // Cập nhật mật khẩu nếu được cung cấp
        if (password) {
          user.password = await bcrypt.hash(password, 10);
        }
        
        await this.userRepository.save(user);
        
        this.winstonLogger.log({
          level: 'info',
          message: `[ADMIN] Người dùng đã được nâng cấp thành admin, ID: ${user.id}`
        });
      } else {
        // Nếu người dùng chưa tồn tại, tạo mới với vai trò admin
        if (!password) {
          throw new BadRequestException('Mật khẩu bắt buộc khi tạo tài khoản admin mới');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user = this.userRepository.create({
          email,
          phoneNumber,
          password: hashedPassword,
          role: UserRole.ADMIN,
          authProvider: AuthProvider.LOCAL,
        });
        
        await this.userRepository.save(user);
        
        this.winstonLogger.log({
          level: 'info',
          message: `[ADMIN] Tài khoản admin mới đã được tạo, ID: ${user.id}`
        });
      }
      
      // Loại bỏ thông tin nhạy cảm trước khi trả về
      const { password: _, ...result } = user;
      return result as User;
    } catch (error) {
      this.winstonLogger.error({
        level: 'error',
        message: `[ADMIN] Lỗi khi tạo/nâng cấp tài khoản admin: ${error.message}`,
        trace: error.stack
      });
      throw error;
    }
  }

  // Thống kê người dùng theo vai trò
  async getUserStats(): Promise<{ total: number; admins: number; users: number }> {
    this.logger.log('Đang lấy thống kê người dùng');
    try {
      // Đếm tổng số người dùng
      const total = await this.userRepository.count();
      
      // Đếm số admin
      const admins = await this.userRepository.count({
        where: { role: UserRole.ADMIN }
      });
      
      // Đếm số người dùng thường
      const users = await this.userRepository.count({
        where: { role: UserRole.USER }
      });
      
      this.winstonLogger.log({
        level: 'info',
        message: `Thống kê người dùng: Tổng số ${total}, Admin ${admins}, Người dùng thường ${users}`
      });
      
      return { total, admins, users };
    } catch (error) {
      this.winstonLogger.error({
        level: 'error',
        message: `Lỗi khi lấy thống kê người dùng: ${error.message}`,
        trace: error.stack
      });
      throw error;
    }
  }

  // Admin: Điều chỉnh coin cho người dùng
  async adjustUserCoins(
    userId: number, 
    adjustCoinDto: AdjustCoinDto, 
    adminId: number
  ): Promise<User> {
    this.logger.log(`[ADMIN] Adjusting coins for user ${userId}: ${adjustCoinDto.amount}`);
    
    // Bắt đầu một transaction để đảm bảo tính nhất quán của dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Tìm người dùng cần điều chỉnh coin
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      
      if (!user) {
        this.logger.warn(`[ADMIN] User not found with ID: ${userId}`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Tìm admin thực hiện điều chỉnh
      const admin = await queryRunner.manager.findOne(User, {
        where: { id: adminId },
      });
      
      if (!admin) {
        this.logger.warn(`[ADMIN] Admin not found with ID: ${adminId}`);
        throw new NotFoundException(`Admin with ID ${adminId} not found`);
      }
      
      if (admin.role !== UserRole.ADMIN) {
        this.logger.warn(`[ADMIN] User ${adminId} is not an admin but tried to adjust coins`);
        throw new ForbiddenException('Only admins can adjust user coins');
      }
      
      // Tính toán số coin mới
      const newBalance = user.coinBalance + adjustCoinDto.amount;
      
      // Không cho phép số coin âm
      if (newBalance < 0) {
        this.logger.warn(`[ADMIN] Cannot adjust coins: would result in negative balance`);
        throw new BadRequestException('Cannot reduce coins below zero');
      }
      
      // Xác định loại giao dịch
      const transactionType = adjustCoinDto.amount >= 0 
        ? TransactionType.DEPOSIT 
        : TransactionType.WITHDRAW;
      
      // Tạo giao dịch mới
      const transaction = this.coinTransactionRepository.create({
        userId: userId,
        amount: Math.abs(adjustCoinDto.amount),
        type: transactionType,
        note: adjustCoinDto.note,
        performedBy: admin.email || `admin-${admin.id}`,
      });
      
      await queryRunner.manager.save(transaction);
      
      // Cập nhật số dư coin của người dùng
      user.coinBalance = newBalance;
      await queryRunner.manager.save(user);
      
      // Commit giao dịch nếu mọi thứ thành công
      await queryRunner.commitTransaction();
      
      this.winstonLogger.log({
        level: 'info',
        message: `[ADMIN] Coins adjusted successfully for user ${userId}: ${adjustCoinDto.amount}, new balance: ${newBalance}`
      });
      
      // Tạo thông báo cho người dùng về thay đổi coin
      try {
        await this.notificationService.createCoinNotification(
          userId,
          adjustCoinDto.amount,
          adjustCoinDto.note
        );
        
        this.logger.log(`[ADMIN] Notification created for coin adjustment for user ${userId}`);
      } catch (notificationError) {
        // Chỉ ghi log lỗi mà không ảnh hưởng đến kết quả của việc điều chỉnh coin
        this.logger.error(`[ADMIN] Error creating notification for coin adjustment: ${notificationError.message}`);
      }
      
      const { password, ...result } = user;
      return result as User;
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      
      this.winstonLogger.error({
        level: 'error',
        message: `[ADMIN] Error adjusting coins: ${error.message}`,
        trace: error.stack
      });
      
      throw error;
    } finally {
      // Giải phóng query runner
      await queryRunner.release();
    }
  }
  
  // Lấy lịch sử giao dịch coin của người dùng
  async getUserCoinTransactions(userId: number): Promise<CoinTransaction[]> {
    this.logger.log(`Getting coin transactions for user ${userId}`);
    
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      
      if (!user) {
        this.logger.warn(`User not found with ID: ${userId}`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      const transactions = await this.coinTransactionRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      
      return transactions;
    } catch (error) {
      this.winstonLogger.error({
        level: 'error',
        message: `Error getting coin transactions: ${error.message}`,
        trace: error.stack
      });
      
      throw error;
    }
  }
  
  // Thống kê tổng số coin trong hệ thống
  async getTotalSystemCoins(): Promise<{
    totalCoins: number;
    totalDeposits: number;
    totalWithdrawals: number;
    usersWithCoins: number;
    recentTransactions: CoinTransaction[];
  }> {
    this.logger.log('Getting total system coins statistics');
    
    try {
      // Lấy tổng số coin hiện có trong hệ thống
      const coinResult = await this.userRepository
        .createQueryBuilder('user')
        .select('SUM(user.coinBalance)', 'totalCoins')
        .getRawOne();
      
      const totalCoins = Number(coinResult.totalCoins) || 0;
      
      // Đếm số người dùng có coin
      const usersWithCoinsResult = await this.userRepository
        .createQueryBuilder('user')
        .where('user.coinBalance > 0')
        .getCount();
      
      // Tính tổng coin đã nạp vào hệ thống
      const depositResult = await this.coinTransactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalDeposits')
        .where('transaction.type = :type', { type: TransactionType.DEPOSIT })
        .getRawOne();
      
      const totalDeposits = Number(depositResult.totalDeposits) || 0;
      
      // Tính tổng coin đã trừ từ hệ thống
      const withdrawalResult = await this.coinTransactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalWithdrawals')
        .where('transaction.type = :type', { type: TransactionType.WITHDRAW })
        .getRawOne();
      
      const totalWithdrawals = Number(withdrawalResult.totalWithdrawals) || 0;
      
      // Lấy những giao dịch gần đây nhất
      const recentTransactions = await this.coinTransactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.user', 'user')
        .orderBy('transaction.createdAt', 'DESC')
        .take(20)
        .getMany();
      
      this.winstonLogger.log({
        level: 'info',
        message: `Coin statistics: Total ${totalCoins}, Deposits ${totalDeposits}, Withdrawals ${totalWithdrawals}, Users with coins ${usersWithCoinsResult}`
      });
      
      return {
        totalCoins,
        totalDeposits,
        totalWithdrawals,
        usersWithCoins: usersWithCoinsResult,
        recentTransactions
      };
    } catch (error) {
      this.winstonLogger.error({
        level: 'error',
        message: `Error getting coin statistics: ${error.message}`,
        trace: error.stack
      });
      
      throw error;
    }
  }

  // Cập nhật thông tin cá nhân của người dùng
  async updateProfile(id: number, updateProfileDto: UpdateProfileDto): Promise<User> {
    this.logger.log(`Cập nhật thông tin profile cho người dùng có ID: ${id}`);
    
    try {
      // Tìm người dùng theo ID
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        this.logger.warn(`Không tìm thấy người dùng với ID: ${id}`);
        throw new NotFoundException(`Người dùng với ID ${id} không tồn tại`);
      }
      
      // Kiểm tra nếu người dùng muốn cập nhật email
      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        // Kiểm tra xem người dùng đã có số điện thoại chưa
        if (!user.phoneNumber) {
          this.logger.warn(`Không thể cập nhật email cho người dùng ID: ${id} vì không có số điện thoại`);
          throw new BadRequestException('Bạn cần cung cấp số điện thoại trước khi thay đổi email');
        }
        
        // Kiểm tra xem email mới đã tồn tại chưa
        const emailExists = await this.userRepository.findOne({ 
          where: { email: updateProfileDto.email } 
        });
        
        if (emailExists) {
          this.logger.warn(`Email đã tồn tại: ${updateProfileDto.email}`);
          throw new ConflictException('Email này đã được sử dụng bởi tài khoản khác');
        }
      }

      // Tạo đối tượng cập nhật
      const updateData: Partial<User> = {};
      
      // Cập nhật các trường thông tin được gửi lên
      if (updateProfileDto.fullName !== undefined) updateData.fullName = updateProfileDto.fullName;
      if (updateProfileDto.email !== undefined) updateData.email = updateProfileDto.email;
      if (updateProfileDto.gender !== undefined) updateData.gender = updateProfileDto.gender;
      if (updateProfileDto.dateOfBirth !== undefined) {
        updateData.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
      }
        // Cập nhật mật khẩu nếu có yêu cầu
      if (updateProfileDto.oldPassword && updateProfileDto.newPassword) {
        // Kiểm tra mật khẩu cũ
        const isPasswordValid = await bcrypt.compare(updateProfileDto.oldPassword, user.password);
        
        if (!isPasswordValid) {
          this.logger.warn(`Mật khẩu cũ không đúng cho người dùng ID: ${id}`);
          throw new BadRequestException('Mật khẩu cũ không chính xác');
        }
        
        // Hash mật khẩu mới
        updateData.password = await bcrypt.hash(updateProfileDto.newPassword, 10);
      }

      // Xử lý avatar - ưu tiên field avatar, nếu không có thì dùng avatarUrl
      if (updateProfileDto.avatar !== undefined) {
        updateData.avatar = updateProfileDto.avatar;
      } else if (updateProfileDto.avatarUrl !== undefined) {
        updateData.avatar = updateProfileDto.avatarUrl;
      }
      
      // Thêm địa chỉ nếu được gửi
      if (updateProfileDto.address !== undefined) updateData.address = updateProfileDto.address;
      
      // Thực hiện cập nhật thông tin
      await this.userRepository.update(id, updateData);
      
      this.winstonLogger.log({
        level: 'info',
        message: `Cập nhật thông tin profile thành công cho người dùng ID: ${id}`
      });
      
      // Trả về thông tin người dùng đã cập nhật
      return this.findOneWithCoins(id);
    } catch (error) {
      // Xử lý lỗi tùy thuộc vào loại lỗi
      if (!(error instanceof NotFoundException) &&
          !(error instanceof BadRequestException) &&
          !(error instanceof ConflictException)) {
        this.winstonLogger.error({
          level: 'error',
          message: `Lỗi khi cập nhật thông tin profile: ${error.message}`,
          trace: error.stack
        });
      }
      throw error;
    }
  }

  /**
   * Cập nhật thông tin cơ bản của người dùng
   * @param userId ID của người dùng
   * @param updateUserSimpleDto Dữ liệu cập nhật đơn giản
   * @returns Thông tin người dùng đã cập nhật
   */
  async updateUserSimple(userId: number, updateUserSimpleDto: UpdateUserSimpleDto) {
    const user = await this.findOne(userId);
    
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${userId}`);
    }
    
    // Log dữ liệu nhận được để debug
    console.log(`Cập nhật thông tin đơn giản cho người dùng ${userId}:`, updateUserSimpleDto);
    
    // Cập nhật thông tin
    if (updateUserSimpleDto.email && updateUserSimpleDto.email !== user.email) {
      // Kiểm tra email đã tồn tại chưa nếu có thay đổi
      const existingUserWithEmail = await this.userRepository.findOne({ 
        where: { email: updateUserSimpleDto.email }
      });
      
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        throw new ConflictException('Email đã được sử dụng bởi tài khoản khác');
      }
      
      // Kiểm tra người dùng phải có số điện thoại mới được cập nhật email
      if (!user.phoneNumber) {
        throw new BadRequestException('Bạn cần xác thực số điện thoại trước khi cập nhật email');
      }
    }
    
    // Áp dụng các thay đổi
    Object.assign(user, updateUserSimpleDto);
    
    // Lưu vào database
    await this.userRepository.save(user);
    
    // Trả về thông tin người dùng đã cập nhật (không bao gồm mật khẩu)
    const { password, ...result } = user;
    return result;
  }
}