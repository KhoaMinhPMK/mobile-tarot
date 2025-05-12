/**
 * Hàm tạo tên vui nhộn từ các con vật
 * @returns {string} Tên ngẫu nhiên từ con vật
 */
export const generateFunnyName = (): string => {
  // Danh sách các con vật
  const animals = [
    'Mèo', 'Chó', 'Gấu', 'Hổ', 'Sư tử', 'Khỉ', 'Voi', 'Ngựa', 'Hươu',
    'Cáo', 'Sóc', 'Thỏ', 'Rùa', 'Cá sấu', 'Chim cánh cụt', 'Cú', 'Đại bàng',
    'Công', 'Hươu cao cổ', 'Gấu trúc', 'Tê giác', 'Lạc đà', 'Báo'
  ];

  // Danh sách các tính cách
  const personalities = [
    'Vui vẻ', 'Thông minh', 'Nhanh nhẹn', 'Dũng cảm', 'Mạnh mẽ', 'Đáng yêu',
    'Hài hước', 'Năng động', 'Lịch lãm', 'Dễ thương', 'Tinh nghịch', 'Thân thiện',
    'Lanh lợi', 'Đáng mến', 'Tài giỏi', 'Siêu đẳng', 'Phi thường'
  ];

  // Danh sách các hậu tố
  const suffixes = [
    'Tuyệt vời', 'Siêu sao', 'Huyền thoại', 'Kỳ diệu', 'Xuất sắc',
    'Phi thường', 'Vô đối', 'Thông thái', 'Hạng nhất', 'Tối thượng'
  ];

  // Chọn ngẫu nhiên các thành phần
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
  
  // 50% cơ hội thêm hậu tố
  const shouldAddSuffix = Math.random() > 0.5;
  let name = `${randomPersonality} ${randomAnimal}`;

  if (shouldAddSuffix) {
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    name += ` ${randomSuffix}`;
  }

  return name;
}; 