import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { getNotifications, markAsRead, deleteNotification, markAllAsRead } from "@/service/notificationService";
import type { Notification } from "@/types/notification";
import { toastError, toastSuccess } from "@/utils/toast";
// Simple date formatting function
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
};

interface NotificationListProps {
  maxItems?: number;
  showActions?: boolean;
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  maxItems = 5,
  showActions = true,
  className = "",
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      const sortedNotifications = response.result.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toastError("Không thể tải thông báo!");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toastSuccess("Đã đánh dấu thông báo đã đọc!");
    } catch (error) {
      console.error("Error marking as read:", error);
      toastError("Không thể đánh dấu đã đọc!");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toastSuccess("Đã xóa thông báo!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toastError("Không thể xóa thông báo!");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toastSuccess("Đã đánh dấu tất cả đã đọc!");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toastError("Không thể đánh dấu tất cả đã đọc!");
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ISSUE":
        return "🐛";
      case "PROJECT":
        return "📁";
      case "TEAM":
        return "👥";
      case "COMMENT":
        return "💬";
      case "ASSIGNMENT":
        return "📋";
      default:
        return "🔔";
    }
  };

  const displayedNotifications = notifications.slice(0, maxItems);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Thông báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Đang tải thông báo...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Thông báo
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {showActions && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Không có thông báo nào.
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.isRead 
                    ? "bg-muted/30" 
                    : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg mt-0.5">
                      {getTypeIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium text-sm ${
                          notification.isRead ? "text-muted-foreground" : "text-foreground"
                        }`}>
                          {notification.title}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                 <span>
                           {formatTimeAgo(notification.createdAt)}
                         </span>
                        {notification.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs"
                            onClick={() => window.open(notification.link, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {showActions && (
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(notification.id)}
                        title="Xóa thông báo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > maxItems && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" className="text-xs">
              Xem tất cả ({notifications.length} thông báo)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 