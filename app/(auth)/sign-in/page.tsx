"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import adminAuthApi from "@/lib/auth"; // Admin Auth API
import { loginSchema } from "@/lib/schema";
import z from "zod";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");

    try {
      // --login that matches API doc ---
      const response = await adminAuthApi.login({
        email: data.email,
        password: data.password,
      });
console.log("Login response:", response);
      // consider API response format: { success, message, data: { access, refresh, ... } }
      if (response.success) {
        router.push("/dashboard"); // redirect after successful login
      } else {
        setError(response.message || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("Login API error:", err);
      setError(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <InnerContainer>
        <div className="flex flex-col gap-0.5 mb-5">
          <h1 className="font-mono text-[32px] font-bold">Welcome Back!</h1>
          <p className="text-sm text-[#616161]">
            Login to access your dashboard
          </p>
        </div>

        <form
          className="flex flex-col gap-y-4 w-full mb-5.5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputWrapper
            type="email"
            name="email"
            placeholder="Enter your email here"
            control={control}
            startIcon={<Mail size={16} className="text-primary" />}
          />

          <InputWrapper
            type="password"
            name="password"
            placeholder="Enter your password here"
            control={control}
            startIcon={<LockKeyhole size={16} className="text-primary" />}
          />

          <Button
            type="submit"
            className="w-full rounded-[5px] bg-primary text-sm text-white py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="flex justify-end">
          <p className="text-sm">
            Forgot Password?{" "}
            <Link href="/forgot-password" className="text-[#9E9E9E]">
              Recover
            </Link>
          </p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}
      </InnerContainer>
    </AuthLayout>
  );
}