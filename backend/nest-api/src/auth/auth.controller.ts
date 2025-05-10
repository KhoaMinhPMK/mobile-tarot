import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Request, 
  UseGuards 
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';

// Định nghĩa kiểu dữ liệu người dùng cho AuthResponse
class UserInfoDto {
  @ApiProperty({ description: 'ID của người dùng', example: 1 })
  id: number;

  @ApiProperty({ description: 'Email của người dùng', example: 'user@example.com', nullable: true })
  email: string;

  @ApiProperty({ description: 'Số điện thoại của người dùng', example: '0987654321', nullable: true })
  phoneNumber: string;

  @ApiProperty({ description: 'Họ tên đầy đủ của người dùng', example: 'Nguyễn Văn A', nullable: true })
  fullName: string;
}

// Định nghĩa kiểu dữ liệu phản hồi cho AuthResponse
class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token dùng để xác thực', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token dùng để làm mới access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ description: 'Thông tin người dùng', type: UserInfoDto })
  user: UserInfoDto;
}

// Định nghĩa kiểu dữ liệu phản hồi cho RefreshToken
class RefreshTokenResponseDto {
  @ApiProperty({ description: 'JWT access token mới', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}

// Định nghĩa kiểu dữ liệu phản hồi cho Logout
class LogoutResponseDto {
  @ApiProperty({ description: 'Trạng thái đăng xuất', example: true })
  success: boolean;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Đăng ký người dùng mới' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Người dùng đã được tạo thành công.',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email hoặc số điện thoại đã tồn tại.' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dữ liệu không hợp lệ.' 
  })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Đăng nhập thành công, trả về JWT token',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Thông tin đăng nhập không chính xác' 
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Đăng xuất thành công',
    type: LogoutResponseDto 
  })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token đã được làm mới thành công',
    type: RefreshTokenResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Refresh token không hợp lệ hoặc đã hết hạn' 
  })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}