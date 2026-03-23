"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminResetPasswordRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    // Maintain query params when redirecting to the proper reset-password route.
    const params = new URLSearchParams();
    if (uid) params.set("uid", uid);
    if (token) params.set("token", token);

    router.replace(`/reset-password?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-slate-500">Redirecting to password reset...</p>
      </div>
    </div>
  );
}
