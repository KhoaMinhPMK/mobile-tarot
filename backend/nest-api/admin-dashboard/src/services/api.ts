import axios from 'axios';

const API_URL = 'http://localhost:3000'; // URL của server NestJS của bạn

// Cấu hình axios với interceptors để thêm token vào header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để đính kèm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Cập nhật token trong header của request ban đầu
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (error) {
        // Nếu refresh token cũng hết hạn, đăng xuất người dùng
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (loginData: { email?: string; phoneNumber?: string; password: string }) => 
    api.post('/auth/login', loginData),
  logout: () => api.post('/auth/logout'),
  signup: (userData: any) => api.post('/auth/signup', userData),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id: number) => api.get(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
  deleteUser: (id: number) => api.delete(`/users/admin/${id}`),
  updateUserRole: (id: number, role: string) => 
    api.patch(`/users/admin/${id}/role`, { role }),
  createAdmin: (adminData: { email?: string; phoneNumber?: string; password: string }) => 
    api.post('/users/admin/create-admin', adminData),
  resetPassword: (resetData: { email?: string; phoneNumber?: string; newPassword: string }) =>
    api.post('/users/reset-password', resetData),
  createUser: (userData: any) => api.post('/auth/signup', userData),
  updateUser: (id: number, userData: any) => api.patch(`/users/${id}`, userData),
  // Thêm API coin
  adjustUserCoins: (userId: number, coinData: { amount: number; note: string }) => 
    api.patch(`/users/admin/${userId}/coins`, coinData),
  getUserCoinTransactions: (userId: number) => 
    api.get(`/users/admin/${userId}/coins/transactions`),
  getTotalSystemCoins: () => api.get('/users/admin/stats/coins')
};

// Notification API
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/me'),
  getUnreadCount: () => api.get('/notifications/me/unread-count'),
  markAllAsRead: () => api.patch('/notifications/me/mark-all-read'),
  markAsRead: (id: number) => api.patch(`/notifications/${id}`, { isRead: true }),
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
  deleteAllNotifications: () => api.delete('/notifications/me'),
};

export default api;