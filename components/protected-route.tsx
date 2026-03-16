"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Keep this in sync with setAuthTokens/clearAuthTokens in lib/apiclient.ts
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/sign-in");
    }
  }, [router]);

  return <>{children}</>;
}
