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
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from "react-redux";
import {googleLogin, login} from "@/store/authReducer.ts";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
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
      }));
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
      console.log(data.email, data.password);
      dispatch(login({email: data.email, password: data.password}));
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
          <CardTitle className="text-xl">Register</CardTitle>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
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
                  <Label htmlFor="password">Password</Label>
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
                  <Label htmlFor="verifyPassword">Verify Password</Label>
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
                  {loading ? 'Creating account...' : 'Sign up'}
                </Button>
              </div>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
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
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}