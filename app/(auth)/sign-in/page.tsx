"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import adminAuthApi, { isSupabaseConfigured } from "@/lib/auth";
import { loginSchema } from "@/lib/schema";
import { startDemoSession } from "@/lib/demo-mode";
import z from "zod";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      if (response.success) {
        router.push("/dashboard");
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const enterDemo = () => {
    startDemoSession();
    router.push("/dashboard");
  };

  return (
    <AuthLayout>
      <InnerContainer>
        <div className="flex flex-col gap-0.5 mb-5">
          <h1 className="font-mono text-[32px] font-bold">Welcome Back!</h1>
          <p className="text-sm text-[#616161]">
            Sign in with your Supabase admin account, or explore the demo.
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
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password here"
            control={control}
            startIcon={<LockKeyhole size={16} className="text-primary" />}
            endIcon={
              <button type="button" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff size={16} className="text-[#9E9E9E]" /> : <Eye size={16} className="text-[#9E9E9E]" />}
              </button>
            }
          />

          <Button
            type="submit"
            className="w-full rounded-[5px] bg-primary text-sm text-white py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !isSupabaseConfigured}
          >
            {isLoading
              ? "Signing in..."
              : isSupabaseConfigured
                ? "Sign in"
                : "Configure Supabase to sign in"}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={enterDemo}
        >
          Explore demo dashboard
        </Button>

        {!isSupabaseConfigured && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Supabase is not configured. Please set up your Supabase project 
          </p>
        )}

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