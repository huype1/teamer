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

class WebSocketService {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, (message: CommentMessage) => void> = new Map();
  private stompSubscriptions: Map<string, StompSubscription> = new Map(); // Store STOMP subscription objects
  private processedMessages: Set<string> = new Set(); // Track processed message IDs
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onConnectCallbacks: (() => void)[] = [];

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
      setTimeout(() => {
        this.connect().catch(() => {
          // Reconnection failed, will try again
        });
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribeToIssueComments(issueId: string, callback: (message: CommentMessage) => void): void {
    if (!this.stompClient || !this.isConnected) {
      console.error('WebSocket not connected, cannot subscribe');
      return;
    }

    const topic = `/topic/issue/${issueId}/comments`;
    
    // If subscription already exists, remove it first
    if (this.subscriptions.has(topic)) {
      this.unsubscribeFromIssueComments(issueId);
    }
    
    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        
        // Prevent duplicate message processing
        const messageId = `${data.commentId || 'unknown'}-${data.type || 'unknown'}`;
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
        
        callback(data as CommentMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Store both the callback and the STOMP subscription object
    this.subscriptions.set(topic, callback);
    this.stompSubscriptions.set(topic, subscription);
  }

  unsubscribeFromIssueComments(issueId: string): void {
    const topic = `/topic/issue/${issueId}/comments`;
    
    // Remove the callback
    this.subscriptions.delete(topic);
    
    // Unsubscribe from STOMP
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

  disconnect(): void {
    if (this.stompClient) {
      // Unsubscribe all STOMP subscriptions
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
}

export const websocketService = new WebSocketService();
export default websocketService; 