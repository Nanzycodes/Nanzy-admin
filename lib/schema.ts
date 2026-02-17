import { z } from "zod";

export const emailSchema = z.object({
  email: z.email("Invalid email address"),
});

export const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),

  password: z.string().min(1, { message: "Password is rerquired" }),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
