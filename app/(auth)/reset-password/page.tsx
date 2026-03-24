"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import adminAuthApi from "@/lib/auth";

type FormValues = {
  new_password: string;
  new_password_confirm: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { new_password: "", new_password_confirm: "" },
  });

  const onSubmit = async (data: FormValues) => {
    if (data.new_password !== data.new_password_confirm) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await adminAuthApi.resetPassword({
        uid,
        token,
        new_password: data.new_password,
        new_password_confirm: data.new_password_confirm,
      });

      console.log("Reset password response:", response);

      // if (response.uid && response.token) {
      //   router.push("/sign-in"); // redirect to login
      // } else {
      //   setError("Failed to reset password. Please try again.");
      // }
    } catch (err: any) {
      console.error("Reset password API error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <InnerContainer>
        <h1 className="font-mono text-[32px] font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-[#616161] mb-4">Enter your new password</p>

        {(!uid || !token) && (
          <p className="text-red-500">
            ⚠️ Invalid or missing reset link. Please check your email for the
            correct link.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <InputWrapper
            type="password"
            name="new_password"
            placeholder="New Password"
            control={control}
          />
          <InputWrapper
            type="password"
            name="new_password_confirm"
            placeholder="Confirm New Password"
            control={control}
          />

          <Button type="submit" disabled={isLoading || !uid || !token}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </InnerContainer>
    </AuthLayout>
  );
}
