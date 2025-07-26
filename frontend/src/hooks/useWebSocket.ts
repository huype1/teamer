import { useEffect, useRef, useCallback } from 'react';
import websocketService, { type CommentMessage } from '@/service/websocketService';

export const useWebSocket = (issueId?: string) => {
  const isConnectedRef = useRef(false);

  const connect = useCallback(async () => {
    try {
      if (!websocketService.isConnectedToWebSocket()) {
        await websocketService.connect();
        isConnectedRef.current = true;
      }
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    isConnectedRef.current = false;
  }, []);

  const subscribeToComments = useCallback((callback: (message: CommentMessage) => void) => {
    if (issueId) {
      websocketService.subscribeToIssueComments(issueId, callback);
    }
  }, [issueId]);

  const unsubscribeFromComments = useCallback(() => {
    if (issueId) {
      websocketService.unsubscribeFromIssueComments(issueId);
    }
  }, [issueId]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (issueId) {
      websocketService.joinCommentRoom(issueId);
    }

    return () => {
      if (issueId) {
        websocketService.leaveCommentRoom(issueId);
        unsubscribeFromComments();
      }
    };
  }, [issueId, unsubscribeFromComments]);

  return {
    isConnected: websocketService.isConnectedToWebSocket(),
    subscribeToComments,
    unsubscribeFromComments,
    connect,
    disconnect,
  };
}; 