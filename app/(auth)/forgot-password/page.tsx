"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import adminAuthApi from "@/lib/auth";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await adminAuthApi.forgotPassword({ email: data.email });
      console.log("Forgot password response:", response);

      if (response.email) {
        // Navigate to "Check your inbox" page and pass email as query param
        router.push(`/check-inbox?email=${encodeURIComponent(response.email)}`);
      } else {
        setError("Failed to request password reset. Please try again.");
      }
    } catch (err: any) {
      console.error("API error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <InnerContainer>
        <h1 className="font-mono text-[32px] font-bold">Forgot Password</h1>
        <p className="text-sm text-[#616161] mb-4">
          Enter your email to receive a password reset link
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputWrapper type="email" name="email" placeholder="Email" control={control} />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <Link href="/sign-in" className="text-sm mt-4 block">
          Back to login
        </Link>
      </InnerContainer>
    </AuthLayout>
  );
}