"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoSession } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
    if (isDemoSession()) {
      if (active) setIsAuthorized(true);
      return;
    }

    if (!supabase) {
      router.replace("/sign-in");
      return;
    }

    const { data, error } = await supabase.auth.getUser();
    if (!active) return;

    if (error || data.user?.app_metadata.role !== "admin") {
      if (data.user) await supabase.auth.signOut();
      router.replace("/sign-in");
      return;
    }

    setIsAuthorized(true);
    }

    void checkAccess();
    return () => {
    active = false;
    };
  }, [router]);

  if (!isAuthorized) {
    return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Checking admin access...
    </div>
    );
  }

  return <>{children}</>;
}
