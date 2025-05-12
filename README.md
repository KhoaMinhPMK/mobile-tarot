# Ứng dụng Xem Tarot Online

Ứng dụng cho phép người dùng dễ dàng kết nối và trò chuyện 1-1 với chuyên gia Tarot thông qua chat (text, hình ảnh, voice, gọi thường, video call). Kèm các chức năng thanh toán, bảo mật lịch sử chat, nhận thông điệp hàng ngày, và làm nhiệm vụ tích điểm.

## Tổng quan dự án

```
mobile-tarot/
├── frontend/
│   └── tarot/
│       ├── android/                # Cấu hình ứng dụng Android
│       ├── ios/                    # Cấu hình ứng dụng iOS
│       ├── src/
│       │   ├── assets/             # Hình ảnh, fonts và tài nguyên tĩnh
│       │   ├── components/         # Các component tái sử dụng
│       │   ├── navigation/         # Cấu hình điều hướng
│       │   ├── screens/            # Các màn hình của ứng dụng
│       │   │   ├── Auth/           # Màn hình xác thực (Login, Register)
│       │   │   ├── Chat/           # Màn hình chat với chuyên gia
│       │   │   ├── Experts/        # Màn hình danh sách chuyên gia
│       │   │   ├── Home/           # Màn hình trang chủ
│       │   │   ├── Settings/       # Màn hình cài đặt
│       │   │   └── Splash/         # Màn hình chào
│       │   ├── utils/              # Các tiện ích và helper
│       │   └── App.tsx             # Component gốc của ứng dụng
│       ├── .env                    # Biến môi trường
│       └── package.json            # Cấu hình dependencies
├── backend/
│   └── nest-api/                   # API server sử dụng NestJS
│       ├── src/
│       │   ├── auth/               # Module xác thực
│       │   ├── user/               # Module quản lý người dùng
│       │   ├── chat/               # Module quản lý chat
│       │   ├── expert/             # Module quản lý chuyên gia
│       │   ├── upload/             # Module upload file
│       │   └── app.module.ts       # Module gốc của ứng dụng
│       ├── .env                    # Biến môi trường
│       └── package.json            # Cấu hình dependencies
└── admin-dashboard/                # Dashboard quản trị
```

## Cập nhật mới
### Xử lý đăng nhập/đăng ký với Google
- Đã sửa lỗi khi đăng nhập bằng Google với tài khoản chưa tồn tại:
  - Không hiển thị lỗi 401 cho người dùng
  - Tự động chuyển sang đăng ký tài khoản mới
  - Chuyển thẳng vào app sau khi đăng ký thành công
- Đã sửa DTO trong backend để bỏ qua validation số điện thoại khi đăng ký với Google
- Đã cải thiện trải nghiệm người dùng khi đăng nhập với Google
- Đã sửa lỗi avatar không được lưu khi đăng ký với Google:
  - Cải thiện cách nhận diện URL avatar từ Google
  - Đảm bảo avatar được gửi đúng cách trong API đăng ký
  - Thêm trường avatar vào response của API signup
- Đã sửa lỗi chức năng "Tiếp tục với Google" trong trang đăng ký:
  - Cải thiện cách xử lý dữ liệu từ Google
  - Bỏ qua validation số điện thoại khi đăng ký với Google
  - Tự động đăng ký tài khoản với thông tin từ Google mà không cần điền thêm số điện thoại
  - Đảm bảo nhất quán giữa trang đăng nhập và đăng ký khi sử dụng Google

> **Lưu ý quan trọng**: Khi đăng nhập hoặc đăng ký với Google, hệ thống sẽ tự động đăng ký tài khoản mới nếu email chưa tồn tại trong hệ thống. Mật khẩu mặc định cho tài khoản là "12345678". Người dùng có thể cập nhật thông tin thêm trong phần Cài đặt.

### Tài khoản Admin
- Có sẵn script `create-admin.js` để tạo tài khoản admin
- Thông tin tài khoản mặc định:
  - Email: admin@gmail.com
  - Mật khẩu: 12345678

## Chức năng đã thực hiện

### Xác thực người dùng
- ✅ Đăng nhập bằng số điện thoại/email và mật khẩu
- ✅ Đăng nhập bằng Google
- ✅ Đăng ký tài khoản mới (số điện thoại, email, mật khẩu)
- ✅ Đăng ký với Google (tự động điền thông tin từ Google)
- ✅ Upload và hiển thị avatar

### Quản lý thông tin cá nhân
- ✅ Xem và chỉnh sửa thông tin cá nhân
- ✅ Thay đổi avatar
- ✅ Đổi mật khẩu

### Lưu ý quan trọng
- Khi đăng nhập/đăng ký với Google, sử dụng mật khẩu mặc định "12345678"
- Avatar được upload lên server và lưu trữ, URL được trả về và lưu trong thông tin người dùng
- Các biến môi trường quan trọng được lưu trong file `.env`
- API_BASE_URL cần được cấu hình đúng với địa chỉ IP của máy chủ để thiết bị mobile có thể kết nối

## Biến môi trường quan trọng
- `API_BASE_URL`: Địa chỉ máy chủ API
- `GOOGLE_WEB_CLIENT_ID`: ID client web của Google cho đăng nhập

## Lệnh chạy ứng dụng
```bash
# Cài đặt dependencies
yarn install

# Chạy ứng dụng trên Android
yarn android

# Chạy ứng dụng trên iOS
yarn ios

# Chạy server API
cd backend/nest-api
yarn start:dev
``` 
