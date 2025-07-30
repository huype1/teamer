export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  link?: string;
  type: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  isEmailSent: boolean;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  message: string;
  result: Notification;
}

export interface NotificationListResponse {
  message: string;
  result: Notification[];
}

export interface NotificationCountResponse {
  message: string;
  result: number;
}

// WebSocket notification message
export interface NotificationMessage {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  notificationId: string;
  title: string;
  content: string;
  link?: string;
  notificationType: string;
  priority: string;
  createdAt: string;
} 