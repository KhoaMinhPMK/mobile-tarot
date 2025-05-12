/**
 * Script để tạo tài khoản admin
 * Chạy bằng lệnh: node create-admin.js
 */

const { exec } = require('child_process');

// Biên dịch dự án nếu chưa có thư mục dist
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Lỗi khi biên dịch: ${error.message}`);
    return;
  }
  
  console.log('Đã biên dịch dự án thành công, đang tạo tài khoản admin...');
  
  // Tạo file tạm để thực thi
  const fs = require('fs');
  const path = require('path');
  
  const tempScriptContent = `
  const { NestFactory } = require('@nestjs/core');
  const { AppModule } = require('./dist/app.module');
  const { UserModule } = require('./dist/user/user.module');
  const { UserService } = require('./dist/user/user.service');
  
  async function bootstrap() {
    try {
      const app = await NestFactory.create(AppModule);
      
      // Lấy UserService từ UserModule
      const userService = app.select(UserModule).get(UserService);
      
      if (!userService) {
        throw new Error('Không thể lấy UserService');
      }
      
      // Tạo tài khoản admin
      await userService.createOrPromoteAdmin('admin@gmail.com', null, '12345678');
      
      console.log('Tài khoản admin đã được tạo thành công!');
      console.log('Email: admin@gmail.com');
      console.log('Mật khẩu: 12345678');
      
      await app.close();
    } catch (error) {
      console.error('Lỗi khi tạo tài khoản admin:', error.message);
      console.error(error);
      process.exit(1);
    }
  }
  
  bootstrap();
  `;
  
  const tempScriptPath = path.join(__dirname, 'temp-create-admin.js');
  
  fs.writeFileSync(tempScriptPath, tempScriptContent);
  
  // Thực thi file tạm
  exec(`node ${tempScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Lỗi khi thực thi: ${error.message}`);
    }
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    // Xóa file tạm
    try {
      fs.unlinkSync(tempScriptPath);
    } catch (err) {
      console.error('Không thể xóa file tạm:', err.message);
    }
  });
}); 