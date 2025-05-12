import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // Sử dụng userService để tạo người dùng mới
    const user = await this.userService.create(createUserDto);
    
    // Sau khi tạo người dùng thành công, tạo token và trả về
    const payload = {
      email: user.email,
      phoneNumber: user.phoneNumber,
      sub: user.id,
      role: user.role, // Thêm role vào payload
    };

    // Tạo access token
    const accessToken = this.jwtService.sign(payload);
    
    // Tạo refresh token và lưu vào database
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    
    await this.userService.setRefreshToken(user.id, refreshToken);

    // Trả về định dạng giống với phương thức login
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role, // Thêm role vào dữ liệu trả về
        avatar: user.avatar, // Thêm avatar vào dữ liệu trả về
      },
    };
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    let user: User;
    
    try {
      // Tìm người dùng theo email hoặc số điện thoại
      if (loginDto.email) {
        user = await this.userService.findByEmail(loginDto.email);
      } else if (loginDto.phoneNumber) {
        user = await this.userService.findByPhoneNumber(loginDto.phoneNumber);
      } else {
        throw new UnauthorizedException('Vui lòng cung cấp email hoặc số điện thoại');
      }
      
      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn(`Đăng nhập thất bại: Mật khẩu không đúng`);
        throw new UnauthorizedException('Email/số điện thoại hoặc mật khẩu không đúng');
      }

      return user;
    } catch (error) {
      this.logger.warn(`Đăng nhập thất bại: ${error.message}`);
      throw new UnauthorizedException('Email/số điện thoại hoặc mật khẩu không đúng');
    }
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      phoneNumber: user.phoneNumber,
      sub: user.id,
      role: user.role, // Thêm role vào payload
    };

    // Tạo access token
    const accessToken = this.jwtService.sign(payload);
    
    // Tạo refresh token và lưu vào database
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    
    await this.userService.setRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role, // Thêm role vào dữ liệu trả về
        avatar: user.avatar, // Thêm avatar vào dữ liệu trả về
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Xác thực refresh token
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;
      
      // Tạo token mới
      const newPayload = {
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        sub: userId,
        role: payload.role, // Thêm role vào payload mới
      };
      
      const accessToken = this.jwtService.sign(newPayload);
      
      return {
        accessToken,
      };
    } catch (error) {
      this.logger.warn(`Làm mới token thất bại: ${error.message}`);
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  async logout(userId: number) {
    await this.userService.setRefreshToken(userId, undefined);
    return { success: true };
  }
}