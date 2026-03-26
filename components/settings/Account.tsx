"use client";

import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { changePasswordSchema } from "@/lib/schema";
import z from "zod";
import adminAuthApi, { AdminProfile } from "@/lib/auth";

type FormValues = z.infer<typeof changePasswordSchema>;

const Account = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    adminAuthApi.getProfile().then(setUser).catch(console.error);
  }, []);

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await adminAuthApi.changePassword(data.password);
      setSuccess("Password changed successfully.");
      reset();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        "Failed to change password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div className="grid text-left text-sm leading-tight bg-[#FFFFFFA3] p-3.5 rounded-[5px] w-auto max-w-fit">
        <span className="truncate font-medium capitalize text-black">
          {user?.first_name} {user?.last_name} 
        </span>
        <span className="truncate text-xs text-[#9E9E9E]">{user?.email}</span>
      </div>

      <form
        className="flex flex-col gap-y-4 w-full max-w-md bg-[#FFFFFFA3] p-3.5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <InputWrapper
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="New password"
          control={control}
          startIcon={<LockKeyhole size={16} className="text-primary" />}
          endIcon={
            <button type="button" onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? <EyeOff size={16} className="text-[#9E9E9E]" /> : <Eye size={16} className="text-[#9E9E9E]" />}
            </button>
          }
        />

        <InputWrapper
          type="password"
          name="confirm_password"
          placeholder="Confirm new password"
          control={control}
          startIcon={<LockKeyhole size={16} className="text-primary" />}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button
          type="submit"
          className="w-full rounded-[5px] bg-primary text-sm text-white py-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
};

export default Account;
