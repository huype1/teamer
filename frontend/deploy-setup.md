# Deployment Setup Guide

## Environment Variables Configuration

### Development Environment (.env.local)

Tạo file `.env.local` trong thư mục `frontend/` với nội dung:

```bash
# Development Environment Variables
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=http://localhost:8080/api/ws
VITE_FRONTEND_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Production Environment (Netlify)

Trong Netlify dashboard, vào **Site settings > Environment variables** và thêm:

```bash
# Production Environment Variables
VITE_API_BASE_URL=https://teamer-b55248b6da98.herokuapp.com/api
VITE_WS_BASE_URL=https://teamer-b55248b6da98.herokuapp.com/api/ws
VITE_FRONTEND_URL=https://your-app-name.netlify.app
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
```

## Netlify Deployment Steps

### 1. Build Configuration
**QUAN TRỌNG**: Vì project có cấu trúc root với frontend folder, bạn cần cấu hình như sau:

#### **Option A: Sử dụng netlify.toml (Khuyến nghị)**
File `netlify.toml` đã được tạo sẵn với cấu hình đúng.

#### **Option B: Cấu hình thủ công trong Netlify dashboard**
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 (hoặc cao hơn)

### 2. Environment Variables
Đảm bảo đã set đúng các biến môi trường trong Netlify:
- `VITE_API_BASE_URL` → Heroku API URL
- `VITE_WS_BASE_URL` → Heroku WebSocket URL (sử dụng https, không phải wss)
- `VITE_FRONTEND_URL` → Netlify app URL
- `VITE_GOOGLE_CLIENT_ID` → Production Google OAuth ID

### 3. Deploy
- Connect GitHub repository
- Trigger build
- Kiểm tra logs để đảm bảo build thành công

## Build Optimization

### Vite Configuration
File `vite.config.ts` đã được tối ưu với:

```typescript
build: {
  outDir: 'dist',
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        utils: ['axios', 'clsx', 'tailwind-merge'],
      },
    },
  },
},
optimizeDeps: {
  exclude: ['highlight.js'],
},
```

### Build Performance
- **Code splitting**: Tự động chia nhỏ bundle
- **Tree shaking**: Loại bỏ code không sử dụng
- **Dependency optimization**: Tối ưu dependencies

## Service Files Status

Tất cả các service files đã được cập nhật để sử dụng environment variables:

✅ **authService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **userService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **teamService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **projectService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **issueService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **sprintService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **commentService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **chatService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **attachmentService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **documentService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **avatarService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **notificationService.ts** - Sử dụng `config.getApiBaseUrl()`
✅ **websocketService.ts** - Sử dụng `config.getWsBaseUrl()`

## Configuration Files

### config/env.ts
File này quản lý tất cả environment variables:

```typescript
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/api/ws',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  getApiBaseUrl: () => config.API_BASE_URL,
  getWsBaseUrl: () => config.WS_BASE_URL,
  getFrontendUrl: () => config.FRONTEND_URL
};
```

**Lưu ý quan trọng**: WebSocket URL sử dụng `http/https` thay vì `ws/wss` vì SockJS cần URL với scheme HTTP để hoạt động đúng.

### vite.config.ts
Proxy configuration cho development:

```typescript
server: {
  proxy: {
    "/api": {
      target: process.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:8080/",
      changeOrigin: true,
    },
  },
},
```

## Testing Deployment

### 1. Local Testing
```bash
# Development
npm run dev

# Production build test
npm run build
npm run preview
```

### 2. Environment Variable Test
Kiểm tra trong browser console:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('WS URL:', import.meta.env.VITE_WS_BASE_URL)
console.log('Frontend URL:', import.meta.env.VITE_FRONTEND_URL)
```

### 3. API Call Test
Kiểm tra network tab trong DevTools để đảm bảo API calls đang sử dụng đúng URL.

## Troubleshooting

### Build Errors
- Kiểm tra Node.js version (cần 18+)
- Xóa `node_modules` và `package-lock.json`, chạy `npm install` lại
- Kiểm tra `netlify.toml` có đúng cấu hình

### Environment Variables Not Working
- Đảm bảo tên biến bắt đầu với `VITE_`
- Restart development server sau khi thay đổi `.env.local`
- Kiểm tra Netlify environment variables đã được set đúng

### API Connection Issues
- Kiểm tra CORS configuration trong backend
- Đảm bảo Heroku app đang running
- Kiểm tra API endpoints trong Network tab

### WebSocket Connection Issues
- Đảm bảo WebSocket URL sử dụng `http/https` thay vì `ws/wss`
- Kiểm tra backend WebSocket endpoint đang hoạt động
- SockJS sẽ tự động handle WebSocket upgrade

## Heroku Backend Configuration

### Environment Variables
Trong Heroku dashboard, thêm environment variable:

```bash
# Heroku Config Vars
FRONTEND_URL=https://your-app-name.netlify.app
```

### CORS Settings
Đảm bảo Heroku backend cho phép CORS từ Netlify domain:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",  // Development
            "https://your-app-name.netlify.app"  // Production
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Backend Services Updated
✅ **InvitationService.java** - Sử dụng `${app.frontend.url}` cho invitation links
✅ **AuthenticationService.java** - Sử dụng `${app.frontend.url}` cho JWT issuer

### Application Configuration
✅ **application.yaml** - Thêm `app.frontend.url` configuration
✅ **application-heroku.yaml** - Thêm `app.frontend.url` cho production

## Security Notes

- Không commit file `.env.local` vào git
- Sử dụng environment variables cho tất cả sensitive data
- Kiểm tra CORS settings trong production
- Đảm bảo HTTPS được enable trong production 