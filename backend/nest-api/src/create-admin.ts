import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import * as readline from 'readline';
import { AuthProvider, UserRole } from './user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';

// Tạo interface readline để nhập thông tin từ console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Hàm để đặt câu hỏi và nhận input từ người dùng
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function bootstrap() {
  // Khởi tạo ứng dụng NestJS
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    console.log('===== TẠO TÀI KHOẢN ADMIN ĐẦU TIÊN =====');
    
    // Lấy repository trực tiếp thay vì qua service để không cần kiểm tra vai trò
    const userRepository = app.get(getRepositoryToken(User));
    
    // Kiểm tra xem có admin nào đã tồn tại chưa
    const existingAdmin = await userRepository.findOne({ 
      where: { role: UserRole.ADMIN } 
    });
    
    if (existingAdmin) {
      console.log('\nĐã tồn tại tài khoản admin trong hệ thống:');
      console.log(`- ID: ${existingAdmin.id}`);
      console.log(`- Email: ${existingAdmin.email || 'Không có'}`);
      console.log(`- Số điện thoại: ${existingAdmin.phoneNumber || 'Không có'}`);
      console.log(`- Họ tên: ${existingAdmin.fullName || 'Không có'}`);
      
      const createAnother = await question('\nBạn có muốn tạo thêm tài khoản admin khác? (y/n): ');
      if (createAnother.toLowerCase() !== 'y') {
        console.log('Hủy tạo tài khoản admin.');
        return;
      }
    }
    
    // Nhập thông tin tài khoản admin mới
    const email = await question('Nhập email (để trống nếu không có): ');
    const phoneNumber = await question('Nhập số điện thoại (10 số, để trống nếu không có): ');
    
    if (!email && !phoneNumber) {
      console.error('Lỗi: Phải cung cấp ít nhất một trong email hoặc số điện thoại.');
      return;
    }
    
    // Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
    if (email) {
      const existingEmail = await userRepository.findOne({ where: { email } });
      if (existingEmail) {
        console.log(`\nEmail ${email} đã được sử dụng bởi người dùng với ID ${existingEmail.id}.`);
        
        const updateRole = await question('Bạn có muốn nâng cấp người dùng này thành admin? (y/n): ');
        
        if (updateRole.toLowerCase() === 'y') {
          await userRepository.update(existingEmail.id, { role: UserRole.ADMIN });
          console.log(`\nĐã nâng cấp người dùng ID ${existingEmail.id} thành admin thành công.`);
          rl.close();
          return;
        } else {
          console.log('Hủy tạo tài khoản admin.');
          rl.close();
          return;
        }
      }
    }
    
    if (phoneNumber) {
      const existingPhone = await userRepository.findOne({ where: { phoneNumber } });
      if (existingPhone) {
        console.log(`\nSố điện thoại ${phoneNumber} đã được sử dụng bởi người dùng với ID ${existingPhone.id}.`);
        
        const updateRole = await question('Bạn có muốn nâng cấp người dùng này thành admin? (y/n): ');
        
        if (updateRole.toLowerCase() === 'y') {
          await userRepository.update(existingPhone.id, { role: UserRole.ADMIN });
          console.log(`\nĐã nâng cấp người dùng ID ${existingPhone.id} thành admin thành công.`);
          rl.close();
          return;
        } else {
          console.log('Hủy tạo tài khoản admin.');
          rl.close();
          return;
        }
      }
    }
    
    // Nhập thông tin còn lại
    const password = await question('Nhập mật khẩu (tối thiểu 8 ký tự): ');
    if (password.length < 8) {
      console.error('Lỗi: Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = await question('Nhập họ tên đầy đủ: ');
    
    // Tạo tài khoản admin mới
    const admin = userRepository.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      password: hashedPassword,
      fullName,
      role: UserRole.ADMIN,
      authProvider: AuthProvider.LOCAL,
    });
    
    await userRepository.save(admin);
    
    console.log(`\nĐã tạo tài khoản admin thành công!`);
    console.log(`- ID: ${admin.id}`);
    console.log(`- Email: ${admin.email || 'Không có'}`);
    console.log(`- Số điện thoại: ${admin.phoneNumber || 'Không có'}`);
    console.log(`- Họ tên: ${admin.fullName || 'Không có'}`);
    console.log('\nBạn có thể sử dụng tài khoản này để đăng nhập và quản lý hệ thống.');
    
  } catch (error) {
    console.error('Đã xảy ra lỗi khi tạo tài khoản admin:', error);
  } finally {
    rl.close();
    await app.close();
  }
}

// Chạy script
bootstrap();