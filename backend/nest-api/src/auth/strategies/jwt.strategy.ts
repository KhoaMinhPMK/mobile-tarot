import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your_jwt_secret_key_here',
    });
  }

  async validate(payload: any) {
    const { sub: userId, email, phoneNumber, role } = payload;
    this.logger.log(`Validating JWT token for user ${userId} with role ${role}`);
    
    try {
      const user = await this.userService.findOne(userId);
      this.logger.log(`User ${userId} successfully validated`);
      return { 
        ...user,
        email,
        phoneNumber,
        role
      };
    } catch (error) {
      this.logger.error(`JWT validation failed for user ${userId}: ${error.message}`);
      throw new UnauthorizedException('Người dùng không tồn tại hoặc token không hợp lệ');
    }
  }
}