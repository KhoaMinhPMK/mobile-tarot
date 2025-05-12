import { getAccessToken, getRefreshToken, saveAccessToken } from './authStorage';

// API Base URL - Đảm bảo đúng địa chỉ server của bạn
const API_BASE_URL = 'http://192.168.69.106:3000';

// Thời gian timeout cho API calls (milliseconds)
const API_TIMEOUT = 30000;

/**
 * Service API giúp gọi các API endpoint và tự động xử lý refresh token khi cần
 */
class ApiService {
  /**
   * Lấy thông tin người dùng theo ID
   * @param userId ID người dùng
   * @returns Thông tin người dùng
   */
  async getUserInfo(userId: number) {
    try {
      console.log(`[API] Đang lấy thông tin người dùng với ID: ${userId}`);
      return await this.fetchWithToken(`/users/${userId}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('[API] Lỗi khi lấy thông tin người dùng:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem chuỗi có phải là URL hợp lệ (http/https)
   * @param url Chuỗi cần kiểm tra
   * @returns Boolean cho biết url có hợp lệ không
   */
  isValidUrl(url: string) {
    try {
      // Nếu URL null hoặc undefined
      if (!url) return false;
      
      // Kiểm tra xem URL có chứa chuỗi của máy chủ không - luôn chấp nhận URL server
      const serverIp = API_BASE_URL.split('//')[1];
      if (url.includes(serverIp)) {
        return true;
      }
      
      // Kiểm tra nếu URL chứa localhost, không hợp lệ trên thiết bị mobile
      // Thay thế localhost bằng IP server thay vì từ chối
      if (url.includes('localhost')) {
        console.log('[API] URL chứa localhost, cần thay thế bằng IP server');
        return false;
      }

      // Kiểm tra URL từ Google (googleusercontent.com)
      if (url.includes('googleusercontent.com')) {
        console.log('[API] Phát hiện URL từ Google, chấp nhận là URL hợp lệ');
        return true;
      }
      
      // Kiểm tra xem chuỗi có phải URL hợp lệ và có protocol http/https không
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  /**
   * Chuyển đổi URL localhost thành URL với IP server
   * @param url URL cần chuyển đổi
   * @returns URL đã được chuyển đổi
   */
  convertLocalhostUrl(url: string): string {
    if (!url) return url;
    
    try {
      // Lấy hostname và protocol từ API_BASE_URL
      const apiHostname = API_BASE_URL.split('//')[1];
      const apiProtocol = API_BASE_URL.split('//')[0] || 'http:';
      
      // Thay thế localhost bằng IP server
      if (url.includes('localhost')) {
        url = url.replace(/http:\/\/localhost:3000/g, `${apiProtocol}//${apiHostname}`);
      }
      
      return url;
    } catch (e) {
      console.error('[API] Lỗi khi chuyển đổi URL:', e);
      return url;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * @param userData Dữ liệu cập nhật cho người dùng
   * @returns Thông tin người dùng đã cập nhật
   */
  async updateUserProfile(userData: any) {
    try {
      console.log('[API] Đang chuẩn bị dữ liệu cập nhật thông tin người dùng');
      
      // Clone dữ liệu để không ảnh hưởng đến đối tượng ban đầu 
      const cleanData = { ...userData };
      
      // Xử lý dateOfBirth đúng cách - chuyển đổi thành chuỗi ISO nếu là Date object
      if ('dateOfBirth' in cleanData) {
        if (cleanData.dateOfBirth instanceof Date) {
          cleanData.dateOfBirth = cleanData.dateOfBirth.toISOString().split('T')[0];
          console.log('[API] Đã chuyển đổi dateOfBirth thành chuỗi ISO:', cleanData.dateOfBirth);
        } else if (typeof cleanData.dateOfBirth === 'string') {
          // Đảm bảo chuỗi dateOfBirth có định dạng YYYY-MM-DD
          const dateMatch = cleanData.dateOfBirth.match(/^\d{4}-\d{2}-\d{2}/);
          if (dateMatch) {
            cleanData.dateOfBirth = dateMatch[0];
          } else {
            console.warn('[API] Loại bỏ dateOfBirth không hợp lệ');
            delete cleanData.dateOfBirth;
          }
        } else if (cleanData.dateOfBirth === null) {
          // Giữ nguyên giá trị null
        } else {
          console.warn('[API] Loại bỏ dateOfBirth không hợp lệ');
          delete cleanData.dateOfBirth;
        }
      }
      
      // Loại bỏ các trường không cần thiết
      const fieldsToRemove = [
        'id', 'phoneNumber', 'coinBalance', 'createdAt', 'updatedAt', 
        'refreshToken', 'authProvider', 'role'
      ];
      fieldsToRemove.forEach(field => {
        if (field in cleanData) {
          delete cleanData[field];
        }
      });
      
      // Xử lý avatar URL với localhost
      if (cleanData.avatar && typeof cleanData.avatar === 'string') {
        cleanData.avatar = this.convertLocalhostUrl(cleanData.avatar);
      }
      
      // Thêm kiểm tra các trường còn lại
      if (cleanData.fullName && typeof cleanData.fullName !== 'string') {
        console.warn('[API] Loại bỏ fullName không hợp lệ');
        delete cleanData.fullName;
      }
      
      if (cleanData.email && typeof cleanData.email !== 'string') {
        console.warn('[API] Loại bỏ email không hợp lệ');
        delete cleanData.email;
      }
      
      if (cleanData.gender && typeof cleanData.gender !== 'string') {
        console.warn('[API] Loại bỏ gender không hợp lệ');
        delete cleanData.gender;
      }
      
      if (cleanData.address && typeof cleanData.address !== 'string') {
        console.warn('[API] Loại bỏ address không hợp lệ');
        delete cleanData.address;
      }
      
      // Xử lý mật khẩu
      if (cleanData.oldPassword && cleanData.newPassword) {
        if (typeof cleanData.oldPassword !== 'string' || typeof cleanData.newPassword !== 'string') {
          console.warn('[API] Loại bỏ thông tin mật khẩu không hợp lệ');
          delete cleanData.oldPassword;
          delete cleanData.newPassword;
        }
      }
      
      // Loại bỏ confirmNewPassword vì backend không cần
      if ('confirmNewPassword' in cleanData) {
        delete cleanData.confirmNewPassword;
      }
      
      // Chi tiết hóa log để dễ debug
      console.log('[API] Chi tiết dữ liệu gửi đi (đã làm sạch):', JSON.stringify(cleanData));
      console.log('[API] Loại dữ liệu của mỗi trường:');
      Object.keys(cleanData).forEach(key => {
        console.log(`- ${key}: ${typeof cleanData[key]}`);
      });
      
      return await this.fetchWithToken('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(cleanData)
      });
    } catch (error) {
      console.error('[API] Lỗi khi cập nhật thông tin người dùng:', error);
      throw error;
    }
  }

  /**
   * Upload ảnh đại diện lên server
   * @param imageUri Đường dẫn đến file ảnh trên thiết bị
   * @returns Thông tin ảnh đã upload (URL)
   */
  async uploadAvatar(imageUri: string) {
    try {
      console.log('[API] Đang upload ảnh đại diện:', imageUri);
      
      // Kiểm tra xem imageUri có phải là URL web hợp lệ không
      if (this.isValidUrl(imageUri)) {
        console.log('[API] URI đã là URL web hợp lệ, không cần upload lại:', imageUri);
        return { url: imageUri };
      }
      
      // Tạo form data để gửi file
      const formData = new FormData();
      
      // Tách tên file từ đường dẫn
      const uriParts = imageUri.split('/');
      const originalFileName = uriParts[uriParts.length - 1];
      
      // Thêm file vào form data
      formData.append('file', {
        uri: imageUri,
        name: originalFileName,
        type: 'image/jpeg' // Mặc định sử dụng JPEG cho tương thích tốt
      } as any);
      
      console.log('[API] Đang chuẩn bị upload file:', originalFileName);
      
      // Gọi API upload với form data
      const accessToken = await getAccessToken();
      const url = `${API_BASE_URL}/upload`;
      
      console.log(`[API] Gọi API upload: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[API] Lỗi khi upload ảnh (${response.status}):`, errorData);
        throw new Error(errorData.message || 'Có lỗi xảy ra khi upload ảnh');
      }
      
      const data = await response.json();
      console.log('[API] Upload ảnh thành công:', data);
      
      // Xử lý URL localhost (thay thành IP thực của server)
      if (data && data.url) {
        // Lấy hostname từ API_BASE_URL (không bao gồm protocol)
        const apiHostname = API_BASE_URL.split('//')[1];
        const apiProtocol = API_BASE_URL.split('//')[0];
        
        // Thay thế bất kỳ URL nào chứa localhost bằng địa chỉ IP thực từ API_BASE_URL
        if (data.url.includes('localhost')) {
          data.url = data.url.replace(/http:\/\/localhost:3000/g, `${apiProtocol}//${apiHostname}`);
          console.log('[API] Đã chuyển đổi URL localhost thành IP server:', data.url);
        }
        
        // Đảm bảo URL sử dụng đúng địa chỉ IP từ API_BASE_URL
        if (data.url.includes('/uploads/')) {
          const fileName = data.url.split('/uploads/').pop();
          data.url = `${apiProtocol}//${apiHostname}/uploads/${fileName}`;
          console.log('[API] Đã chuẩn hóa URL uploads:', data.url);
        }
      }
      
      return data;
    } catch (error) {
      console.error('[API] Lỗi khi upload ảnh đại diện:', error);
      throw error;
    }
  }

  /**
   * Thực hiện request với token authentication và timeout
   * @param endpoint API endpoint
   * @param options Fetch options
   * @param retried Đã thử refresh token chưa (tránh lặp vô tận)
   * @returns Response data
   */
  async fetchWithToken(endpoint: string, options: RequestInit = {}, retried = false): Promise<any> {
    try {
      const accessToken = await getAccessToken();
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log(`[API] Gọi API: ${url}`);
      
      const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      };

      // Thêm xử lý timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId); // Xóa timeout nếu request hoàn thành

        // Kiểm tra response status
        if (response.status === 204) {
          // No content - không có dữ liệu trả về
          return null;
        }

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Nếu token hết hạn và chưa thử refresh
        if (response.status === 401 && !retried) {
          console.log('[API] Token hết hạn, đang thử refresh token...');
          
          // Thử refresh token
          const newAccessToken = await this.refreshToken();
          
          if (newAccessToken) {
            console.log('[API] Đã refresh token thành công, gọi lại API ban đầu');
            // Gọi lại API ban đầu với token mới
            return this.fetchWithToken(endpoint, options, true);
          } else {
            throw new Error('Token hết hạn và không thể refresh');
          }
        }

        // Nếu response không thành công
        if (!response.ok) {
          console.error(`[API] Lỗi API (${response.status}):`, data);
          const errorMessage = data && data.message ? data.message : 'Có lỗi xảy ra khi gọi API';
          throw new Error(errorMessage);
        }

        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId); // Đảm bảo xóa timeout nếu có lỗi
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Yêu cầu API đã hết thời gian chờ.');
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('[API] Lỗi khi gọi API:', error);
      throw error;
    }
  }

  /**
   * Refresh token khi access token hết hạn
   * @returns Access token mới hoặc null nếu không thành công
   */
  async refreshToken() {
    try {
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        console.error('[API] Không có refresh token');
        return null;
      }
      
      console.log('[API] Đang gọi API refresh token');
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('[API] Lỗi khi refresh token:', await response.json());
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.accessToken;
      
      if (newAccessToken) {
        // Lưu access token mới
        await saveAccessToken(newAccessToken);
        console.log('[API] Đã lưu access token mới');
        return newAccessToken;
      }
      
      return null;
    } catch (error) {
      console.error('[API] Lỗi khi refresh token:', error);
      return null;
    }
  }

  /**
   * Kiểm tra và làm sạch dữ liệu trước khi gửi API
   * @param data Dữ liệu cần làm sạch
   * @param allowedFields Danh sách các trường được phép
   * @returns Dữ liệu đã được làm sạch
   */
  validateData(data: any, allowedFields: string[] = []): any {
    if (!data || typeof data !== 'object') {
      return {};
    }

    // Clone dữ liệu để không ảnh hưởng đến đối tượng ban đầu
    const cleanData = { ...data };
    
    // Nếu có danh sách các trường được phép, chỉ giữ lại các trường này
    if (allowedFields.length > 0) {
      Object.keys(cleanData).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete cleanData[key];
        }
      });
    }
    
    // Làm sạch các giá trị rỗng hoặc undefined
    Object.keys(cleanData).forEach(key => {
      const value = cleanData[key];
      
      // Xóa các giá trị undefined hoặc null
      if (value === undefined || value === null) {
        delete cleanData[key];
        return;
      }
      
      // Xóa chuỗi rỗng
      if (typeof value === 'string' && value.trim() === '') {
        delete cleanData[key];
      }
    });
    
    return cleanData;
  }

  /**
   * Cập nhật thông tin cơ bản của người dùng (phương thức mới, đơn giản hơn)
   * @param userData Dữ liệu cập nhật đơn giản
   * @returns Thông tin người dùng đã cập nhật
   */
  async updateUserSimple(userData: any) {
    try {
      console.log('[API] Đang chuẩn bị dữ liệu cập nhật thông tin người dùng (đơn giản)');
      
      // Clone dữ liệu để không ảnh hưởng đến đối tượng ban đầu 
      const cleanData: any = {};
      
      // Chỉ lấy các trường cần thiết, bỏ qua các trường có thể gây lỗi
      const allowedFields = ['fullName', 'email', 'gender', 'avatar', 'address'];
      
      allowedFields.forEach(field => {
        if (userData[field] !== undefined && userData[field] !== null) {
          cleanData[field] = userData[field];
        }
      });
      
      // Xử lý avatar URL với localhost
      if (cleanData.avatar && typeof cleanData.avatar === 'string') {
        cleanData.avatar = this.convertLocalhostUrl(cleanData.avatar);
      }
      
      // Chi tiết hóa log để dễ debug
      console.log('[API] Chi tiết dữ liệu gửi đi (đã làm sạch):', JSON.stringify(cleanData));
      
      // Gọi API endpoint mới 
      return await this.fetchWithToken('/users/update-simple', {
        method: 'PATCH',
        body: JSON.stringify(cleanData)
      });
    } catch (error) {
      console.error('[API] Lỗi khi cập nhật thông tin người dùng (đơn giản):', error);
      throw error;
    }
  }

  /**
   * Đăng nhập bằng số điện thoại/email và mật khẩu
   * @param phoneNumber Số điện thoại người dùng
   * @param email Email người dùng
   * @param password Mật khẩu người dùng
   * @returns Thông tin đăng nhập bao gồm token và thông tin người dùng
   */
  async login(phoneNumber?: string, email?: string, password: string) {
    try {
      console.log('[API] Đang thực hiện đăng nhập');
      
      // Chuẩn bị dữ liệu đăng nhập
      const loginData: any = { password };
      
      // Thêm số điện thoại hoặc email vào dữ liệu đăng nhập
      if (phoneNumber) {
        loginData.phoneNumber = phoneNumber;
        console.log('[API] Đăng nhập với số điện thoại:', phoneNumber);
      } else if (email) {
        loginData.email = email;
        console.log('[API] Đăng nhập với email:', email);
      } else {
        throw new Error('Vui lòng cung cấp số điện thoại hoặc email');
      }
      
      // Gọi API đăng nhập
      const url = `${API_BASE_URL}/auth/login`;
      console.log(`[API] Gọi API đăng nhập: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      // Xử lý response
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[API] Lỗi khi đăng nhập (${response.status}):`, errorData);
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }
      
      const data = await response.json();
      console.log('[API] Đăng nhập thành công:', data);
      
      return data;
    } catch (error) {
      console.error('[API] Lỗi khi đăng nhập:', error);
      throw error;
    }
  }

  /**
   * Đăng ký tài khoản mới
   * @param userData Thông tin đăng ký người dùng
   * @returns Thông tin đăng ký bao gồm token và thông tin người dùng
   */
  async register(userData: {
    fullName: string,
    password: string,
    authProvider?: string,
    email?: string,
    phoneNumber?: string,
    avatar?: string
  }) {
    try {
      console.log('[API] Đang thực hiện đăng ký tài khoản');
      
      // Clone dữ liệu để không ảnh hưởng đến đối tượng ban đầu
      const registerData = { ...userData };
      
      // Xử lý avatar URL với localhost nếu có
      if (registerData.avatar && typeof registerData.avatar === 'string') {
        // Kiểm tra xem avatar có phải là URL hợp lệ không
        if (this.isValidUrl(registerData.avatar)) {
          console.log('[API] Avatar là URL hợp lệ:', registerData.avatar);
          registerData.avatar = this.convertLocalhostUrl(registerData.avatar);
        } else {
          console.log('[API] Avatar không phải URL hợp lệ, có thể cần upload:', registerData.avatar);
          // Nếu không phải URL hợp lệ, có thể là đường dẫn local, sẽ xử lý sau
          // Giữ nguyên giá trị để xử lý ở backend
        }
      }
      
      // Loại bỏ các trường rỗng để tránh lỗi validation
      Object.keys(registerData).forEach(key => {
        if (registerData[key] === '' || registerData[key] === undefined) {
          delete registerData[key];
        }
      });
      
      console.log('[API] Dữ liệu đăng ký (đã làm sạch):', JSON.stringify(registerData, null, 2));
      
      // Gọi API đăng ký
      const url = `${API_BASE_URL}/auth/signup`;
      console.log(`[API] Gọi API đăng ký: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      
      // Xử lý response
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[API] Lỗi khi đăng ký (${response.status}):`, errorData);
        throw new Error(errorData.message || 'Đăng ký thất bại');
      }
      
      const data = await response.json();
      console.log('[API] Đăng ký thành công:', data);
      
      return data;
    } catch (error) {
      console.error('[API] Lỗi khi đăng ký:', error);
      throw error;
    }
  }

  /**
   * Đăng ký tự động với thông tin từ Google
   * @param googleData Thông tin từ Google
   * @returns Thông tin đăng ký bao gồm token và thông tin người dùng
   */
  async registerWithGoogle(googleData: any) {
    try {
      console.log('[API] Đang thực hiện đăng ký tự động với Google');
      
      // Kiểm tra dữ liệu đầu vào
      if (!googleData || !googleData.email) {
        throw new Error('Thiếu thông tin email từ Google');
      }
      
      // Chuẩn bị dữ liệu đăng ký
      const registerData = {
        fullName: googleData.name || `${googleData.givenName || ''} ${googleData.familyName || ''}`.trim(),
        email: googleData.email,
        password: '12345678', // Mật khẩu mặc định cho đăng ký Google
        authProvider: 'google',
        avatar: googleData.photo || undefined
        // Không gửi phoneNumber khi đăng ký với Google
      };
      
      console.log('[API] Dữ liệu đăng ký Google:', JSON.stringify(registerData, null, 2));
      
      // Gọi API đăng ký
      return await this.register(registerData);
    } catch (error) {
      console.error('[API] Lỗi khi đăng ký với Google:', error);
      throw error;
    }
  }
}

// Export một instance để sử dụng trong cả ứng dụng
export default new ApiService(); 