export interface User {
  id: number;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email?: string;
    phoneNumber?: string;
    fullName?: string;
    role: string;
  };
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum NotificationType {
  SYSTEM = 'system',
  COIN = 'coin',
  USER = 'user',
  ANNOUNCEMENT = 'announcement',
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}