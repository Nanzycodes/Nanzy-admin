"use client";

import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CheckInboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  return (
    <AuthLayout>
      <InnerContainer>
        <h1 className="font-mono text-[32px] font-bold mb-2">Check Your Inbox</h1>
        <p className="text-sm text-[#616161] mb-6">
          We sent a password reset link to <strong>{email}</strong>. Please check your email to continue.
        </p>

        <Button onClick={() => router.push("/sign-in")}>Back to Login</Button>
      </InnerContainer>
    </AuthLayout>
  );
}