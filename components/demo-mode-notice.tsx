"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  clearDemoSession,
  getDemoDataMode,
  isDemoSession,
  setDemoDataMode,
  subscribeToDemoSession,
} from "@/lib/demo-mode";

export default function DemoModeNotice() {
  const router = useRouter();
  const showNotice = useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSession,
    () => false,
  );
  const dataMode = useSyncExternalStore(
    subscribeToDemoSession,
    getDemoDataMode,
    () => "sample",
  );

  if (!showNotice) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div>
        <p className="font-semibold">Demo workspace</p>
        <p>
          Demo data: {dataMode}.                     Dashboard, products, orders, users, payments, notifications, and
          analytics use browser-local demo data; none is connected to live marketplace operations.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={dataMode === "sample" ? "default" : "outline"}
          onClick={() => setDemoDataMode("sample")}
        >
          Sample data
        </Button>
        <Button
          type="button"
          size="sm"
          variant={dataMode === "empty" ? "default" : "outline"}
          onClick={() => setDemoDataMode("empty")}
        >
          Empty data
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            clearDemoSession();
            router.replace("/sign-in");
          }}
        >
          Exit demo
        </Button>
      </div>
    </div>
  );
}
