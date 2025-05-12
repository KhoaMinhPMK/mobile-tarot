import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys cho AsyncStorage
const KEYS = {
  ACCESS_TOKEN: 'tarot_access_token',
  REFRESH_TOKEN: 'tarot_refresh_token',
  USER_INFO: 'tarot_user_info',
};

// Lưu access token
export const saveAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
    console.log('Access token đã được lưu vào bộ nhớ đệm');
  } catch (error) {
    console.error('Lỗi khi lưu access token:', error);
    throw error;
  }
};

// Lấy access token
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    return token;
  } catch (error) {
    console.error('Lỗi khi lấy access token:', error);
    return null;
  }
};

// Lưu refresh token
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
    console.log('Refresh token đã được lưu vào bộ nhớ đệm');
  } catch (error) {
    console.error('Lỗi khi lưu refresh token:', error);
    throw error;
  }
};

// Lấy refresh token
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    return token;
  } catch (error) {
    console.error('Lỗi khi lấy refresh token:', error);
    return null;
  }
};

// Lưu thông tin người dùng
export const saveUserInfo = async (userInfo: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER_INFO, JSON.stringify(userInfo));
    console.log('Thông tin người dùng đã được lưu vào bộ nhớ đệm:', userInfo);
  } catch (error) {
    console.error('Lỗi khi lưu thông tin người dùng:', error);
    throw error;
  }
};

// Lấy thông tin người dùng
export const getUserInfo = async (): Promise<any | null> => {
  try {
    const userInfoString = await AsyncStorage.getItem(KEYS.USER_INFO);
    if (userInfoString) {
      return JSON.parse(userInfoString);
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return null;
  }
};

// Xóa tất cả dữ liệu xác thực (đăng xuất)
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER_INFO
    ]);
    console.log('Đã xóa tất cả dữ liệu xác thực');
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu xác thực:', error);
    throw error;
  }
}; 