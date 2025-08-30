# Environment Variables Setup

## Tạo file .env.local

Tạo file `.env.local` trong thư mục `frontend/` với nội dung sau:

```bash
# Development Environment Variables
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=http://localhost:8080/api/ws
VITE_FRONTEND_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Lưu ý quan trọng

1. **WebSocket URL**: Sử dụng `http/https` thay vì `ws/wss` vì SockJS cần URL với scheme HTTP
2. **Frontend URL**: Cần thiết cho Google OAuth và các redirect URLs
3. **File .env.local**: Không commit file này vào git (đã có trong .gitignore)
4. **Restart server**: Sau khi tạo file, restart development server để load environment variables

## Kiểm tra setup

Sau khi tạo file, kiểm tra trong browser console:

```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('WS URL:', import.meta.env.VITE_WS_BASE_URL)
console.log('Frontend URL:', import.meta.env.VITE_FRONTEND_URL)
```

## Production Environment

Khi deploy lên Netlify, set các environment variables trong Netlify dashboard:

```bash
VITE_API_BASE_URL=https://teamer-b55248b6da98.herokuapp.com/api
VITE_WS_BASE_URL=https://teamer-b55248b6da98.herokuapp.com/api/ws
VITE_FRONTEND_URL=https://your-app-name.netlify.app
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
```

## Google OAuth Setup

Trong Google Cloud Console, thêm các URLs sau vào **Authorized JavaScript origins**:

```
Development:
- http://localhost:5173

Production:
- https://your-app-name.netlify.app
```
