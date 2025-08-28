import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';

export interface CommentMessage {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  commentId: string;
  issueId: string;
  content?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  messageId: string;
  chatId: string;
  content?: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  senderAvatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: AttachmentInfo[];
}

export interface AttachmentInfo {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
}

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

class WebSocketService {
  private stompClient: Client | null = null;
  private commentSubscriptions: Map<string, (message: CommentMessage) => void> = new Map();
  private chatSubscriptions: Map<string, (message: ChatMessage) => void> = new Map();
  private notificationSubscriptions: Map<string, (message: NotificationMessage) => void> = new Map();
  private stompSubscriptions: Map<string, StompSubscription> = new Map();
  private processedMessages: Set<string> = new Set();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onConnectCallbacks: (() => void)[] = [];

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Nếu đã connected thì return ngay
      if (this.isConnected && this.stompClient) {
        resolve();
        return;
      }

      // Nếu đang connecting thì đợi
      if (this.stompClient && !this.isConnected) {
        this.onConnectCallbacks.push(() => resolve());
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        this.stompClient = new Client({
          webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
          debug: () => {
            // Disable debug logging
          },
          reconnectDelay: 10000, // Tăng delay để giảm spam
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.onConnectCallbacks.forEach(cb => cb());
          this.onConnectCallbacks = [];
          resolve();
        };

        this.stompClient.onDisconnect = () => {
          this.isConnected = false;
          this.attemptReconnect();
        };

        this.stompClient.onStompError = (frame) => {
          console.error('STOMP error:', frame);
          this.isConnected = false;
          reject(new Error(frame.headers.message));
        };

        this.stompClient.activate();
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  onConnect(cb: () => void) {
    if (this.isConnected) {
      cb();
    } else {
      this.onConnectCallbacks.push(cb);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, 5000 * this.reconnectAttempts); // Tăng delay để giảm spam
    } else {
      console.error('Max reconnection attempts reached, stopping reconnection');
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompSubscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
      this.commentSubscriptions.clear();
      this.chatSubscriptions.clear();
      this.notificationSubscriptions.clear();
      this.stompSubscriptions.clear();
      this.processedMessages.clear();
    }
  }

  // Comment subscription methods
  subscribeToIssueComments(issueId: string, callback: (message: CommentMessage) => void): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket not connected, cannot subscribe');
      return;
    }

    const topic = `/topic/issue/${issueId}/comments`;
    
    if (this.commentSubscriptions.has(topic)) {
      this.unsubscribeFromIssueComments(issueId);
    }
    
    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        const messageId = `${data.commentId || 'unknown'}-${data.type || 'unknown'}`;
        if (this.processedMessages.has(messageId)) {
          return;
        }
        
        this.processedMessages.add(messageId);
        
        if (this.processedMessages.size > 100) {
          const firstKey = this.processedMessages.values().next().value;
          if (firstKey) {
            this.processedMessages.delete(firstKey);
          }
        }
        
        callback(data as CommentMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    this.commentSubscriptions.set(topic, callback);
    this.stompSubscriptions.set(topic, subscription);
  }

  unsubscribeFromIssueComments(issueId: string): void {
    const topic = `/topic/issue/${issueId}/comments`;
    
    this.commentSubscriptions.delete(topic);
    
    const stompSubscription = this.stompSubscriptions.get(topic);
    if (stompSubscription) {
      stompSubscription.unsubscribe();
      this.stompSubscriptions.delete(topic);
    }
  }

  // Chat subscription methods
  subscribeToChatMessages(chatId: string, callback: (message: ChatMessage) => void): void {
    console.log('Attempting to subscribe to chat messages for chatId:', chatId);
    console.log('WebSocket connected:', this.isConnected);
    
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket not connected, cannot subscribe');
      return;
    }

    const topic = `/topic/chat/${chatId}/messages`;
    console.log('Subscribing to topic:', topic);
    
    if (this.chatSubscriptions.has(topic)) {
      console.log('Unsubscribing from existing chat subscription');
      this.unsubscribeFromChatMessages(chatId);
    }
    
    const subscription = this.stompClient.subscribe(topic, (message) => {
      console.log('Received chat message:', message.body);
      try {
        const data = JSON.parse(message.body);
        const messageId = `${data.messageId || 'unknown'}-${data.type || 'unknown'}`;
        if (this.processedMessages.has(messageId)) {
          console.log('Message already processed, skipping:', messageId);
          return;
        }
        
        this.processedMessages.add(messageId);
        
        if (this.processedMessages.size > 100) {
          const firstKey = this.processedMessages.values().next().value;
          if (firstKey) {
            this.processedMessages.delete(firstKey);
          }
        }
        
        console.log('Calling chat message callback with data:', data);
        callback(data as ChatMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    this.chatSubscriptions.set(topic, callback);
    this.stompSubscriptions.set(topic, subscription);
    console.log('Successfully subscribed to chat messages for chatId:', chatId);
  }

  unsubscribeFromChatMessages(chatId: string): void {
    const topic = `/topic/chat/${chatId}/messages`;
    
    this.chatSubscriptions.delete(topic);
    
    const stompSubscription = this.stompSubscriptions.get(topic);
    if (stompSubscription) {
      stompSubscription.unsubscribe();
      this.stompSubscriptions.delete(topic);
    }
  }

  // Notification subscription methods
  subscribeToUserNotifications(userId: string, callback: (message: NotificationMessage) => void): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket not connected, cannot subscribe');
      return;
    }

    const topic = `/user/${userId}/notifications`;
    
    if (this.notificationSubscriptions.has(topic)) {
      this.unsubscribeFromUserNotifications(userId);
    }
    
    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        const messageId = `${data.notificationId || 'unknown'}-${data.type || 'unknown'}`;
        if (this.processedMessages.has(messageId)) {
          return;
        }
        
        this.processedMessages.add(messageId);
        
        if (this.processedMessages.size > 100) {
          const firstKey = this.processedMessages.values().next().value;
          if (firstKey) {
            this.processedMessages.delete(firstKey);
          }
        }
        
        callback(data as NotificationMessage);
      } catch (error) {
        console.error('Error parsing WebSocket notification message:', error);
      }
    });
    
    this.notificationSubscriptions.set(topic, callback);
    this.stompSubscriptions.set(topic, subscription);
  }

  unsubscribeFromUserNotifications(userId: string): void {
    const topic = `/user/${userId}/notifications`;
    
    this.notificationSubscriptions.delete(topic);
    
    const stompSubscription = this.stompSubscriptions.get(topic);
    if (stompSubscription) {
      stompSubscription.unsubscribe();
      this.stompSubscriptions.delete(topic);
    }
  }

  isConnectedToWebSocket(): boolean {
    return this.isConnected;
  }

  joinCommentRoom(issueId: string): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.publish({
        destination: '/app/comment/join',
        body: JSON.stringify({ issueId })
      });
    }
  }

  leaveCommentRoom(issueId: string): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.publish({
        destination: '/app/comment/leave',
        body: JSON.stringify({ issueId })
      });
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService; 