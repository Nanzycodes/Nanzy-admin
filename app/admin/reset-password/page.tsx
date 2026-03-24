"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminResetPasswordRedirectPage({
  searchParams,
}: {
  searchParams: { uid?: string; token?: string };
}) {
  const router = useRouter();

  useEffect(() => {
    const uid = searchParams.uid;
    const token = searchParams.token;

    // Maintain query params when redirecting to the proper reset-password route.
    const params = new URLSearchParams();
    if (uid) params.set("uid", uid);
    if (token) params.set("token", token);

    router.replace(`/reset-password?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Redirecting to password reset...
        </p>
      </div>
    </div>
  );
}
