import { z } from "zod";

// Login schema and type
export const loginSchema = z.object({
  email: z.string().min(2),
  password: z.string().min(6),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  verifyPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.verifyPassword, {
  message: "Passwords do not match",
  path: ["verifyPassword"],
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export type GoogleUser = {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export type GoogleCredentials = {
  idToken: string;
  email: string;
  name: string;
  picture: string;
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
}
