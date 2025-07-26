import React from 'react';
import { useWebSocketContext } from './WebSocketProvider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export const WebSocketStatus: React.FC = () => {
  const { isConnected } = useWebSocketContext();

  return (
    <Badge 
      variant={isConnected ? "default" : "secondary"}
      className="fixed bottom-4 right-4 z-50"
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          Kết nối thời gian thực
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Mất kết nối
        </>
      )}
    </Badge>
  );
}; 