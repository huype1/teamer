# Âm Thanh Thông Báo

## Tổng quan

Hệ thống âm thanh thông báo đơn giản sử dụng Web Audio API để phát âm thanh khi có notification mới.

## Tính năng

- ✅ Phát âm thanh khác nhau theo mức độ ưu tiên (URGENT, HIGH, NORMAL, LOW)
- ✅ Bật/tắt âm thanh với nút toggle trong notification bell
- ✅ Lưu trạng thái âm thanh vào localStorage
- ✅ Tự động phát âm thanh khi có notification mới qua WebSocket
- ✅ Hook React để dễ dàng sử dụng

## Cách sử dụng

### 1. Trong component

```tsx
import { useNotificationSound } from '@/hooks/useNotificationSound';

const MyComponent = () => {
  const { isEnabled, toggleSound, playSound } = useNotificationSound();

  const handleNewNotification = () => {
    // Phát âm thanh với priority
    playSound('NORMAL');
  };

  return (
    <button onClick={toggleSound}>
      {isEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
    </button>
  );
};
```

### 2. Trực tiếp với soundUtils

```tsx
import soundUtils from '@/utils/soundUtils';

// Phát âm thanh
soundUtils.playNotificationSound('URGENT');

// Bật/tắt âm thanh
soundUtils.setEnabled(false);
```

## Các loại âm thanh

| Priority | Mô tả | Âm thanh |
|----------|-------|----------|
| URGENT | Khẩn cấp | 2 tiếng beep ngắn (1000Hz) |
| HIGH | Cao | 1 tiếng beep dài (900Hz) |
| NORMAL | Bình thường | 1 tiếng beep (800Hz) |
| LOW | Thấp | 1 tiếng beep nhẹ (600Hz) |

## Test âm thanh

Truy cập `/sound-test` để test các loại âm thanh khác nhau.

## Lưu ý

- Âm thanh chỉ hoạt động sau khi user tương tác với trang (click, scroll, etc.)
- Trạng thái âm thanh được lưu vào localStorage
- Âm thanh tự động phát khi có notification mới qua WebSocket
