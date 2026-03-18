"use client";

import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import adminAuthApi from "@/lib/auth";

type Props = {
  uid: string;
  token: string;
};

type FormValues = {
  new_password: string;
  new_password_confirm: string;
};

export default function ResetPasswordClient({ uid, token }: Props) {
  const router = useRouter();
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

      if (response.uid && response.token) {
        router.push("/sign-in");
      } else {
        setError("Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {(!uid || !token) && (
        <p className="text-red-500">⚠️ Invalid or missing reset link.</p>
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
    </>
  );
}
