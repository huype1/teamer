import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import type { NotificationMessage } from '@/types/notification';

class NotificationWebSocketService {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, (message: NotificationMessage) => void> = new Map();
  private stompSubscriptions: Map<string, StompSubscription> = new Map();
  private processedMessages: Set<string> = new Set();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        this.stompClient = new Client({
          webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
          debug: () => {
            // Disable debug logging
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
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

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(() => {
          // Reconnection failed, will try again
        });
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
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
      this.subscriptions.clear();
      this.stompSubscriptions.clear();
      this.processedMessages.clear();
    }
  }

  subscribeToUserNotifications(userId: string, callback: (message: NotificationMessage) => void): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket not connected, cannot subscribe');
      return;
    }

    const topic = `/user/${userId}/notifications`;
    
    // If subscription already exists, remove it first
    if (this.subscriptions.has(topic)) {
      this.unsubscribeFromUserNotifications(userId);
    }
    
    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        
        // Prevent duplicate message processing
        const messageId = `${data.notificationId || 'unknown'}-${data.type || 'unknown'}`;
        if (this.processedMessages.has(messageId)) {
          return;
        }
        
        // Mark message as processed
        this.processedMessages.add(messageId);
        
        // Clean up old processed messages (keep only last 100)
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
    
    this.subscriptions.set(topic, callback);
    this.stompSubscriptions.set(topic, subscription);
  }

  unsubscribeFromUserNotifications(userId: string): void {
    const topic = `/user/${userId}/notifications`;
    
    this.subscriptions.delete(topic);
    
    const stompSubscription = this.stompSubscriptions.get(topic);
    if (stompSubscription) {
      stompSubscription.unsubscribe();
      this.stompSubscriptions.delete(topic);
    }
  }

  isConnectedToWebSocket(): boolean {
    return this.isConnected;
  }
}

export const notificationWebSocketService = new NotificationWebSocketService();
export default notificationWebSocketService; 