# Ứng dụng Xem Tarot Online

Ứng dụng di động cho phép người dùng kết nối và trò chuyện 1-1 với chuyên gia Tarot, xem thông điệp hàng ngày và tham gia nhiệm vụ tích điểm.

## Các cập nhật mới nhất

### (Ngày cập nhật hiện tại) - Hỗ trợ avatarUrl và address

- **Cập nhật Backend**: Backend đã được cập nhật để hỗ trợ các trường `avatarUrl` và `address`
- **Khôi phục chức năng**: Đã thêm lại các trường `avatarUrl` và `address` vào API cập nhật thông tin người dùng
- **Quy trình đầy đủ**: Nay ứng dụng có thể thực hiện quy trình upload avatar và cập nhật thông tin đầy đủ

### (Cập nhật trước) - Cập nhật về xử lý hình ảnh

- **Tự động chuyển đổi sang PNG**: Tất cả ảnh đại diện được upload sẽ tự động được chuyển đổi sang định dạng PNG
- **Cải thiện xử lý kết nối**: Tự động chuyển đổi URL localhost thành IP máy chủ thực tế
- **Tăng cường độ tin cậy**: Thêm cơ chế dự phòng để lưu ảnh cục bộ khi upload thất bại
- **Sửa lỗi kỹ thuật**: Đã thêm kiểu trả về Promise\<any\> cho phương thức fetchWithToken

**Chi tiết kỹ thuật**:
1. Sửa đổi phương thức `uploadAvatar` trong `apiService.ts` để tự động đổi tên file và loại ảnh thành PNG
2. Cập nhật `handleImageSelected` trong `SettingsScreen.tsx` để thử upload trước, nếu thất bại sẽ chuyển sang lưu cục bộ
3. Tự động chuyển đổi URL từ "http://localhost:3000" thành "http://[IP_thực_tế]:3000"

### (Cập nhật trước) - Cập nhật về chức năng avatar

- **Vấn đề kết nối API**: Đã phát hiện vấn đề khi gọi API upload avatar, nhận lỗi "Network request failed"
- **Vấn đề trường API**: API không chấp nhận các trường `avatar`, `avatarUrl`, và `address`
- **Giải pháp tạm thời**: Lưu avatar cục bộ trong state và AsyncStorage để hiển thị trong ứng dụng
- **Lưu ý**: Avatar sẽ mất khi đóng ứng dụng do được lưu cục bộ

**Chi tiết kỹ thuật**:
1. Loại bỏ trường `avatarUrl` và `address` khỏi request API `/users/profile`
2. Bỏ qua việc upload avatar lên server do lỗi kết nối
3. Lưu URI ảnh cục bộ vào state và AsyncStorage để hiển thị tạm thời

## Cấu trúc thư mục dự án

```
tarot/
├── android/                  # Cấu hình cho Android
├── ios/                      # Cấu hình cho iOS
├── src/
│   ├── assets/               # Hình ảnh, fonts và các tài nguyên khác
│   ├── components/           # Components tái sử dụng
│   ├── navigation/           # Cấu hình điều hướng
│   ├── screens/              # Các màn hình của ứng dụng
│   │   ├── Auth/             # Màn hình liên quan đến xác thực
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Home/             # Màn hình chính
│   │   │   └── HomeScreen.tsx
│   │   ├── Settings/         # Màn hình cài đặt
│   │   │   └── SettingsScreen.tsx
│   │   └── Experts/          # Màn hình danh sách chuyên gia
│   │       └── ExpertsListScreen.tsx
│   └── utils/                # Các tiện ích và hàm helper
│       ├── authStorage.ts    # Quản lý lưu trữ token và thông tin người dùng
│       ├── apiService.ts     # Service gọi API và xử lý refresh token
│       └── nameGenerator.ts  # Công cụ tạo tên ngẫu nhiên
├── App.tsx                   # Điểm vào của ứng dụng
├── package.json              # Quản lý dependencies
└── README.md                 # Tài liệu dự án
```

## Các API endpoints

### Authentication

- **Đăng ký**: `POST /auth/signup`
  - Body: `{ fullName, phoneNumber, password, authProvider }`
  - Response: `{ accessToken, refreshToken, user }`

- **Đăng nhập**: `POST /auth/login`
  - Body: `{ phoneNumber, password }`
  - Response: `{ accessToken, refreshToken, user }`

- **Refresh Token**: `POST /auth/refresh-token`
  - Body: `{ refreshToken }`
  - Response: `{ accessToken }`

### User

- **Lấy thông tin người dùng**: `GET /users/{id}`
  - Headers: `Authorization: Bearer {accessToken}`
  - Response: Chi tiết thông tin người dùng

- **Cập nhật thông tin người dùng**: `PATCH /users/profile`
  - Headers: `Authorization: Bearer {accessToken}`
  - Body: `{ fullName, email, gender, dateOfBirth, avatarUrl, address }`
  - Response: Thông tin người dùng đã cập nhật
  - Lưu ý: Backend đã được cập nhật để hỗ trợ các trường `avatarUrl` và `address`

### Upload

- **Upload avatar**: `POST /upload/avatar`
  - Headers: `Authorization: Bearer {accessToken}`
  - Body: Form-data với trường `file` chứa file hình ảnh (sẽ tự động được chuyển thành PNG)
  - Response: `{ url: string }` - URL của ảnh đã upload
  - Lưu ý: 
    - Bất kể định dạng gốc của ảnh là gì, ứng dụng sẽ tự động đổi tên file và gửi dưới dạng PNG
    - API trả về URL dạng "localhost" sẽ được tự động chuyển đổi thành địa chỉ IP thực của server

## Quy trình upload avatar

Quy trình upload avatar đầy đủ gồm 2 bước:

1. **Upload ảnh** bằng API `/upload/avatar` và nhận về URL của ảnh
    - Lưu ý: URL trả về có thể chứa "localhost" sẽ được tự động chuyển đổi thành IP thực tế của server
2. **Cập nhật thông tin người dùng** bằng API `/users/profile` với trường `avatarUrl` chứa URL đã nhận

Ứng dụng hiện tại sẽ tự động thực hiện quy trình trên nếu API hoạt động, hoặc chuyển sang lưu ảnh cục bộ nếu gặp lỗi kết nối.

## Các tính năng đã phát triển

1. **Xác thực người dùng**
   - Đăng ký tài khoản với số điện thoại và mật khẩu
   - Lưu trữ token xác thực và thông tin người dùng
   - Refresh token tự động khi hết hạn

2. **Quản lý thông tin người dùng**
   - Hiển thị thông tin người dùng từ API
   - Hiển thị số xu trên header
   - Cập nhật ảnh đại diện (lưu cục bộ)
   - Thay đổi thông tin cá nhân (họ tên, email, giới tính, ngày sinh)

3. **Màn hình chính**
   - Hiển thị thông tin người dùng và số dư xu
   - Các dịch vụ xem bói Tarot

4. **Cài đặt tài khoản**
   - Hiển thị và cập nhật thông tin cá nhân
   - Đổi ảnh đại diện với tùy chọn chụp ảnh hoặc chọn từ thư viện

## Cài đặt và chạy project

1. Cài đặt dependencies:

```bash
yarn install
```

2. Chạy ứng dụng trên Android:

```bash
yarn android
```

3. Chạy ứng dụng trên iOS:

```bash
yarn ios
```

## Lưu ý quan trọng

- Đảm bảo thay đổi API_BASE_URL trong `apiService.ts` thành địa chỉ IP của máy tính để thiết bị di động kết nối được với API
- Tokens được lưu trữ trong AsyncStorage và được tự động refresh khi hết hạn
- Backend đã được cập nhật để hỗ trợ các trường `avatarUrl` và `address`, cho phép lưu trữ avatar và địa chỉ người dùng