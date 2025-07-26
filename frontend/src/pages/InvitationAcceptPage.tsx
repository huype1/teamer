import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { acceptProjectInvitation } from "@/service/projectService";

const InvitationAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const hasTriedAccept = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Liên kết lời mời không hợp lệ. Không tìm thấy token.');
      return;
    }

    if (isAuthenticated) {
      if (hasTriedAccept.current) return;
      hasTriedAccept.current = true;
      setStatus('loading');
      acceptProjectInvitation(token)
        .then(() => {
          setStatus('success');
          setMessage('Bạn đã tham gia dự án thành công!');
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err?.response?.data?.message || 'Không thể tham gia dự án.');
        });
    } else {
      try {
        localStorage.setItem('pendingInvitationToken', token);
        setStatus('success');
        setMessage('Lời mời đã được lưu. Vui lòng đăng nhập hoặc tạo tài khoản để tham gia dự án.');
      } catch (error) {
        console.error('Error saving invitation token:', error);
        setStatus('error');
        setMessage('Không thể xử lý lời mời. Vui lòng thử lại.');
      }
    }
  }, [searchParams, isAuthenticated]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Đang xử lý lời mời...';
      case 'success':
        return isAuthenticated ? 'Đã tham gia dự án!' : 'Lời mời đã được chấp nhận!';
      case 'error':
        return 'Lỗi lời mời';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">{getStatusTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {status === 'success' && isAuthenticated && (
            <div className="space-y-2">
              <Button onClick={() => navigate('/projects')}>Vào dự án</Button>
            </div>
          )}
          {status === 'success' && !isAuthenticated && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Lời mời của bạn đã được lưu. Bạn sẽ được tự động thêm vào dự án sau khi đăng nhập.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/register">Tạo tài khoản</Link>
                </Button>
              </div>
            </div>
          )}
          {status === 'error' && (
            <Button asChild>
              <Link to="/">Về trang chủ</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationAcceptPage; 