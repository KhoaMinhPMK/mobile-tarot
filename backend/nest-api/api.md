# API Documentation cho cập nhật Profile và Upload Avatar

## 1. API Upload Avatar

```
POST /upload/avatar
```

### Headers:
```
Authorization: Bearer your_jwt_token
Content-Type: multipart/form-data
```

### Body:
Sử dụng `multipart/form-data` với một trường:
- **file**: File hình ảnh (jpg, jpeg, png, hoặc gif) không vượt quá 5MB

### Response thành công (200):
```json
{
  "url": "http://localhost:3000/uploads/12345678-1234-1234-1234-123456789012.jpg"
}
```

## 2. API Cập nhật thông tin người dùng

```
PATCH /users/profile
```

### Headers:
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

### Body (tất cả đều là optional):
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "example@gmail.com",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "avatar": "http://localhost:3000/uploads/12345678-1234-1234-1234-123456789012.jpg",
  "avatarUrl": "http://localhost:3000/uploads/12345678-1234-1234-1234-123456789012.jpg",
  "address": "Hà Nội, Việt Nam",
  "oldPassword": "mậtKhẩuCũ123",
  "newPassword": "mậtKhẩuMới123"
}
```

> **Lưu ý về avatarUrl và avatar**: Bạn có thể sử dụng `avatar` hoặc `avatarUrl`, cả hai trường đều được hỗ trợ và đều có chức năng giống nhau. API sẽ ưu tiên sử dụng giá trị từ trường `avatar` trước, nếu không có thì mới sử dụng giá trị từ `avatarUrl`.
```

### Response thành công (200):
```json
{
  "id": 1,
  "fullName": "Nguyễn Văn A",
  "email": "example@gmail.com",
  "phoneNumber": "0987654321",
  "gender": "male",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "avatar": "http://localhost:3000/uploads/12345678-1234-1234-1234-123456789012.jpg",
  "address": "Hà Nội, Việt Nam",
  "role": "user",
  "authProvider": "local",
  "coinBalance": 0,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-05-10T00:00:00.000Z"
}
```

## Quy trình cập nhật avatar đúng cách:

1. **Upload avatar trước** sử dụng API `/upload/avatar`
2. **Nhận URL avatar** từ response
3. **Cập nhật thông tin người dùng** sử dụng API `/users/profile`, đưa URL avatar vào trường `avatar`

Với cách làm này, bạn sẽ không gặp lỗi `property avatar should not exist` như khi gửi đường dẫn file cục bộ (file:///).

# API Cập nhật thông tin người dùng đơn giản mới

```
PATCH /users/update-simple
```

### Headers:
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

### Body (tất cả đều là optional):
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "example@gmail.com",
  "gender": "male",
  "avatar": "http://example.com/uploads/avatar.jpg",
  "address": "Hà Nội, Việt Nam"
}
```

> **Lưu ý**: API này được thiết kế đơn giản hơn, không bao gồm các trường phức tạp như dateOfBirth hoặc mật khẩu để tránh lỗi validation.

### Response thành công (200):
```json
{
  "id": 1,
  "fullName": "Nguyễn Văn A",
  "email": "example@gmail.com",
  "phoneNumber": "0987654321",
  "gender": "male",
  "dateOfBirth": null,
  "avatar": "http://example.com/uploads/avatar.jpg",
  "address": "Hà Nội, Việt Nam",
  "role": "user",
  "authProvider": "local",
  "coinBalance": 0,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-05-10T00:00:00.000Z"
}
```