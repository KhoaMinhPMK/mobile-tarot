import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Kiểm tra xem người dùng có tồn tại và có vai trò ADMIN không
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền admin để thực hiện hành động này');
    }

    return true;
  }
}