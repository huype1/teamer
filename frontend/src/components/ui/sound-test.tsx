import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotificationSound } from "@/hooks/useNotificationSound";

const SoundTest = () => {
  const { isEnabled, toggleSound, playSound } = useNotificationSound();

  const testSounds = [
    { priority: 'URGENT', label: 'Khẩn cấp', description: '2 tiếng beep ngắn' },
    { priority: 'HIGH', label: 'Cao', description: '1 tiếng beep dài' },
    { priority: 'NORMAL', label: 'Bình thường', description: '1 tiếng beep' },
    { priority: 'LOW', label: 'Thấp', description: '1 tiếng beep nhẹ' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'NORMAL':
        return 'bg-blue-500';
      case 'LOW':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔊 Test Âm Thanh
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Bật" : "Tắt"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Kiểm tra âm thanh thông báo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Âm thanh:</span>
          <Button variant="outline" size="sm" onClick={toggleSound}>
            {isEnabled ? "Tắt" : "Bật"}
          </Button>
        </div>

        <div className="space-y-3">
          {testSounds.map((sound) => (
            <div key={sound.priority} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(sound.priority)}`} />
                <div>
                  <div className="font-medium">{sound.label}</div>
                  <div className="text-xs text-muted-foreground">{sound.description}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playSound()}
                disabled={!isEnabled}
              >
                Phát
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundTest;
