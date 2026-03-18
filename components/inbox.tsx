"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CheckInboxClient({ email }: { email: string }) {
  const router = useRouter();

  return (
    <>
      <h1 className="font-mono text-[32px] font-bold mb-2">Check Your Inbox</h1>

      <p className="text-sm text-[#616161] mb-6">
        We sent a password reset link to <strong>{email}</strong>.
      </p>

      <Button onClick={() => router.push("/sign-in")}>Back to Login</Button>
    </>
  );
}
