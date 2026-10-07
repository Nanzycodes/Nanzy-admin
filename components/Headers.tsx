"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";

import { SidebarTrigger } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import { navData } from "./app-sidebar";
import { userAvatar } from "@/lib/utils";
import { Box, UserRound } from "lucide-react";
import notificationsApi, { Notification } from "@/lib/notifications-api";
import { formatDistanceToNow } from "date-fns";
import {
  DemoDataMode,
  getDemoDataMode,
  isDemoSession,
  subscribeToDemoSession,
} from "@/lib/demo-mode";
import {
  getDemoAdminAlerts,
  saveDemoAdminAlerts,
} from "@/lib/demo-notifications";

function isNotification(value: unknown): value is Notification {
  if (typeof value !== "object" || value === null) return false;
  const notification = value as Record<string, unknown>;
  return (
    typeof notification.id === "string" &&
    typeof notification.category === "string" &&
    typeof notification.title === "string" &&
    typeof notification.message === "string" &&
    typeof notification.is_read === "boolean" &&
    typeof notification.created_at === "string"
  );
}

function parseNotifications(payload: unknown): Notification[] {
  let items: unknown = payload;
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    items = payload.data;
  }
  if (!Array.isArray(items) || !items.every(isNotification)) {
    throw new Error("The notification service returned an invalid response.");
  }
  return items;
}

function NotificationBellIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 15.5V10.5C8.5 7.96 10.46 6 13 6C15.54 6 17.5 7.96 17.5 10.5V15.5L19.2 17.2C19.48 17.48 19.25 18 18.85 18H7.15C6.75 18 6.52 17.48 6.8 17.2L8.5 15.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 18.75C11.64 19.5 12.36 19.5 13 18.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="16.8" cy="7.2" r="2.2" fill="#635BFF" opacity="0.9" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [userImage, setUserImage] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  const activeProject = navData.navMain.find((item) => item.url === pathname);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (demoSession) {
      try {
        setNotifications(getDemoAdminAlerts(dataMode));
        setNotificationError(null);
      } catch (error) {
        setNotifications([]);
        setNotificationError(
          error instanceof Error ? error.message : "Could not load saved demo alerts.",
        );
      }
      return;
    }
    try {
      const res = await notificationsApi.list();
      setNotifications(parseNotifications(res.data));
      setNotificationError(null);
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : "Could not load notifications.",
      );
    }
  }, [dataMode, demoSession]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        setUserImage(user?.profile_picture || "");
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    if (demoSession) {
      const updated = notifications.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      );
      try {
        saveDemoAdminAlerts(dataMode, updated);
        setNotifications(updated);
        setNotificationError(null);
      } catch (error) {
        setNotificationError(
          error instanceof Error ? error.message : "Could not save the demo alert state.",
        );
      }
      return;
    }
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : "Could not mark this notification as read.",
      );
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    if (demoSession) {
      const updated = notifications.map((item) => ({ ...item, is_read: true }));
      try {
        saveDemoAdminAlerts(dataMode, updated);
        setNotifications(updated);
        setNotificationError(null);
      } catch (error) {
        setNotificationError(
          error instanceof Error ? error.message : "Could not save the demo alert state.",
        );
      } finally {
        setMarkingAll(false);
      }
      return;
    }
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      setNotificationError(
        error instanceof Error ? error.message : "Could not mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-8 py-4 sm:pr-10 border border-[#E6E6E6] rounded-[5px]">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {activeProject?.icon && (
          <activeProject.icon className={`w-4.5 h-4.5 `} fill="" />
        )}
        <p>/ {activeProject?.title}</p>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        {/* Bell with dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={dropdownOpen}
            aria-haspopup="dialog"
            className="relative flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E9E7FF] bg-[#F5F3FF] text-[#2F2B45] transition-colors hover:bg-[#EEEAFE]"
          >
            <NotificationBellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#635BFF] px-1 text-[9px] font-bold leading-none text-white shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div
              role="dialog"
              aria-label="Admin notifications"
              className="absolute right-0 top-10 z-50 w-[360px] bg-white border border-[#E6E6E6] rounded-[8px] shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F5F5]">
                <span className="text-sm font-semibold text-[#212121]">
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={markingAll}
                    className="text-xs text-[#635BFF] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notificationError && (
                  <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">
                    {notificationError}
                  </p>
                )}
                {notifications.length === 0 && !notificationError ? (
                  <p className="py-10 text-center text-sm text-[#9E9E9E]">
                    No notifications
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-[#F5F5F5] last:border-0 ${
                        !item.is_read ? "bg-[#FAFAFE]" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#ECEBFF] flex items-center justify-center shrink-0 mt-0.5">
                        <Box size={14} className="text-[#635BFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.title && (
                          <p className="text-[10px] font-semibold text-[#635BFF] uppercase tracking-wide mb-0.5">
                            {item.title}
                          </p>
                        )}
                        <p className="text-sm text-[#212121]">{item.message}</p>
                        <p className="text-xs text-[#9E9E9E] mt-0.5">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!item.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="shrink-0 mt-1 w-2 h-2 rounded-full bg-[#635BFF] cursor-pointer"
                          aria-label={`Mark ${item.title || "notification"} as read`}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          type="button"
          aria-label="User profile"
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E9E7FF] bg-[#F5F3FF] text-[#2F2B45] transition-colors hover:bg-[#EEEAFE]"
        >
          {userImage ? (
            <div className="relative h-7 w-7 overflow-hidden rounded-[6px]">
              <Image
                src={userImage}
                alt="User profile"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <UserRound className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}
