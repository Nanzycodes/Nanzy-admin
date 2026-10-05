"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import NotificationsWorkspace from "@/components/notifications/notifications-workspace";
import {
  createDemoNotification,
  DemoNotification,
  DemoNotificationInput,
  getDemoNotifications,
  saveDemoNotifications,
} from "@/lib/demo-notifications";
import {
  DemoDataMode,
  getDemoDataMode,
  isDemoSession,
  subscribeToDemoSession,
} from "@/lib/demo-mode";

export default function NotificationsPage() {
  const demoSession = useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSession,
    () => false,
  );
  const dataMode = useSyncExternalStore<DemoDataMode>(
    subscribeToDemoSession,
    getDemoDataMode,
    () => "sample",
  );
  const [notifications, setNotifications] = useState<DemoNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!demoSession) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      setNotifications(getDemoNotifications(dataMode));
      setError(null);
    } catch (loadError) {
      setNotifications([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load saved demo notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, [demoSession, dataMode]);

  const persistNotifications = useCallback(
    (next: DemoNotification[]) => {
      if (!demoSession) {
        setError("Notification campaigns are unavailable until demo mode is enabled.");
        return false;
      }
      try {
        saveDemoNotifications(dataMode, next);
        setNotifications(next);
        setError(null);
        return true;
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? `Could not save the demo notification: ${saveError.message}`
            : "Could not save the demo notification.",
        );
        return false;
      }
    },
    [dataMode, demoSession],
  );

  function handleCreate(input: DemoNotificationInput) {
    return persistNotifications([createDemoNotification(input), ...notifications]);
  }

  function handleRetry(id: string) {
    const next = notifications.map((notification) =>
      notification.id === id && notification.status === "failed"
        ? {
            ...notification,
            status: "queued" as const,
            failureReason: null,
            failedCount: 0,
            attemptCount: notification.attemptCount + 1,
            createdAt: new Date().toISOString(),
          }
        : notification,
    );
    persistNotifications(next);
  }

  function handleCancelSchedule(id: string) {
    const next = notifications.map((notification) =>
      notification.id === id && notification.status === "scheduled"
        ? { ...notification, status: "cancelled" as const }
        : notification,
    );
    persistNotifications(next);
  }

  return (
    <div className="max-w-6xl">
      <NotificationsWorkspace
        notifications={notifications}
        onCreate={handleCreate}
        onRetry={handleRetry}
        onCancelSchedule={handleCancelSchedule}
        loading={loading}
        error={error}
        isDemo={demoSession}
      />
    </div>
  );
}
