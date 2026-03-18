"use client";

import InputWrapper from "@/components/input-container";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import adminAuthApi from "@/lib/auth";
import { z } from "zod";

const inviteSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirm: z.string().min(6, "Passwords must match"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof inviteSchema>;

export default function InviteAdmin() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { password: "", password_confirm: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await adminAuthApi.acceptInvite({
        token,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      if (response.success) {
        router.push("/login?reset=true");
      } else {
        setError(response.message || "Failed to accept invite.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {token === "" && (
        <p className="text-red-500">⚠️ No token found in URL.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputWrapper
          type="password"
          name="password"
          placeholder="Enter your password"
          control={control}
          startIcon={<LockKeyhole size={16} />}
        />
        <InputWrapper
          type="password"
          name="password_confirm"
          placeholder="Confirm password"
          control={control}
          startIcon={<LockKeyhole size={16} />}
        />
        <Button type="submit" disabled={isLoading || token === ""}>
          {isLoading ? "Processing..." : "Accept Invite"}
        </Button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  );
}
