import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useEffect } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from "react-redux";
import {googleLogin, login} from "@/store/authReducer.ts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues, type GoogleUser } from "@/types/auth";
import authService from "@/service/authService.ts";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state: any) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  
  const [searchParams] = useSearchParams();

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
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: GoogleUser = jwtDecode(credentialResponse.credential);
      await dispatch(googleLogin({
        idToken: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      }) as unknown as any);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleGoogleError = () => {
    console.log('Google login failed');
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password});
      dispatch(login({email: data.email, password: data.password}) as unknown as any);
      // navigate('/');
    } catch (error: any) {
        console.error('Registration failed:', error);
        // Handle error appropriately, e.g., set error state
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Đăng ký</CardTitle>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Tên</Label>
                  <Input
                      id="name"
                      type="text"
                      placeholder="Tên của bạn"
                      {...register("name")}
                  />
                  {errors.name && (
                      <span className="text-xs text-red-500">{errors.name.message}</span>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...register("email")}
                  />
                  {errors.email && (
                      <span className="text-xs text-red-500">{errors.email.message}</span>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                      id="password"
                      type="password"
                      {...register("password")}
                  />
                  {errors.password && (
                      <span className="text-xs text-red-500">{errors.password.message}</span>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="verifyPassword">Xác nhận mật khẩu</Label>
                  <Input
                      id="verifyPassword"
                      type="password"
                      {...register("verifyPassword")}
                  />
                  {errors.verifyPassword && (
                      <span className="text-xs text-red-500">{errors.verifyPassword.message}</span>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
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
                  text="register_with"
                  theme="outline"
                  width="100%"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-muted-foreground text-center text-xs text-balance">
            Bạn đã có tài khoản? <a href="/login" className="text-primary hover:underline">Đăng nhập</a>
          </div>
        </CardFooter>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Bằng cách nhấp tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        và <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  );
}