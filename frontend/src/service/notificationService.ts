import axios from "axios";
import addReqToken from "@/utils/addReqToken";
import type { 
  NotificationListResponse, 
  NotificationCountResponse,
  NotificationResponse 
} from "@/types/notification";

const baseUrl = "http://localhost:8080/api/notifications";

// Lấy danh sách notifications
export const getNotifications = async () => {
  const res = await axios.get(baseUrl, addReqToken(localStorage.getItem("token")));
  return res.data as NotificationListResponse;
};

// Lấy số lượng unread notifications
export const getUnreadCount = async () => {
  const res = await axios.get(`${baseUrl}/unread-count`, addReqToken(localStorage.getItem("token")));
  return res.data as NotificationCountResponse;
};

// Mark tất cả notifications as read
export const markAllAsRead = async () => {
  const res = await axios.put(`${baseUrl}/mark-all-read`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Mark single notification as read
export const markAsRead = async (notificationRecipientId: string) => {
  const res = await axios.put(`${baseUrl}/${notificationRecipientId}/read`, {}, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Xóa notification
export const deleteNotification = async (notificationRecipientId: string) => {
  const res = await axios.delete(`${baseUrl}/${notificationRecipientId}`, addReqToken(localStorage.getItem("token")));
  return res.data;
};

// Tạo notification (cho testing)
export const createNotification = async (data: {
  userIds: string[];
  title: string;
  content: string;
  link?: string;
  type: string;
  entityType?: string;
  entityId?: string;
  priority?: string;
}) => {
  const res = await axios.post(baseUrl, data, addReqToken(localStorage.getItem("token")));
  return res.data as NotificationResponse;
};

export default {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
  createNotification
}; 