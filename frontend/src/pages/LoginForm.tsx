import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useEffect } from "react";
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {googleLogin, login} from "@/store/authReducer.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues, type GoogleUser } from "@/types/auth";

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
const useAppDispatch: () => AppDispatch = useDispatch;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to return URL if provided, otherwise to dashboard
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl));
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate, searchParams]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('No credential received from Google');
      return;
    }
    
    try {
      const decoded: GoogleUser = jwtDecode(credentialResponse.credential);
      await dispatch(googleLogin({
        idToken: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      }));
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleGoogleError = () => {
    console.log('Google login failed');
  };

  const onSubmit = async (data: LoginFormValues) => {
    await dispatch(login(data));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Chào mừng trở lại</CardTitle>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="text"
                      placeholder="m@example.com"
                      {...register("email")}
                  />
                  {errors.email && (
                      <span className="text-xs text-red-500">{errors.email.message}</span>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Mật khẩu</Label>
                  </div>
                  <Input
                      id="password"
                      type="password"
                      {...register("password")}
                  />
                  {errors.password && (
                      <span className="text-xs text-red-500">{errors.password.message}</span>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Hoặc tiếp tục với
                </span>
              </div>
              <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  theme="outline"
                  width="100%"
              />

              <div className="text-center text-sm">
                Chưa có tài khoản?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Đăng ký
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Bằng cách nhấp tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        và <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  );
}