# Heroku Environment Variables Setup

## Cần thiết cho deployment thành công

### 1. Heroku Config Vars

Trong Heroku dashboard, vào **Settings > Config Vars** và thêm:

```bash
# Database
JDBC_DATABASE_URL=your-postgresql-url
JDBC_DATABASE_USERNAME=your-db-username
JDBC_DATABASE_PASSWORD=your-db-password

# JWT
JWT_SIGNER_KEY=your-jwt-secret-key

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# AWS S3 (nếu sử dụng)
AWS_BUCKET=your-s3-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key

# Frontend URL (QUAN TRỌNG cho invitation và JWT)
FRONTEND_URL=https://your-app-name.netlify.app
```

### 2. Frontend URL Configuration

**QUAN TRỌNG**: Biến `FRONTEND_URL` được sử dụng trong:

1. **InvitationService.java** - Tạo invitation links trong email
2. **AuthenticationService.java** - JWT issuer field

### 3. Development vs Production

#### Development (local):
```bash
FRONTEND_URL=http://localhost:5173
```

#### Production (Heroku):
```bash
FRONTEND_URL=https://your-app-name.netlify.app
```

### 4. Kiểm tra setup

Sau khi deploy, kiểm tra:

1. **Invitation emails** có chứa đúng Netlify URL
2. **JWT tokens** có issuer đúng
3. **CORS** cho phép Netlify domain

### 5. Troubleshooting

#### Invitation links không hoạt động:
- Kiểm tra `FRONTEND_URL` trong Heroku Config Vars
- Đảm bảo URL không có trailing slash

#### JWT validation errors:
- Kiểm tra issuer trong JWT token
- Đảm bảo `FRONTEND_URL` đúng format

#### CORS errors:
- Kiểm tra CORS configuration trong SecurityConfig.java
- Đảm bảo Netlify domain được allow
