export interface Notification {
  id: string;
  title: string;
  content: string;
  link?: string;
  type: string;
  entityType?: string;
  entityId?: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  title: string;
  content: string;
  link?: string;
  type: string;
  entityType?: string;
  entityId?: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isEmailSent: boolean;
}

export interface NotificationResponse {
  message: string;
  result: NotificationRecipient;
}

export interface NotificationListResponse {
  message: string;
  result: NotificationRecipient[];
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