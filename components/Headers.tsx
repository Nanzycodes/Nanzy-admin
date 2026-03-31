"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { navData } from "./app-sidebar";
import { userAvatar } from "@/lib/utils";
import { Input } from "./ui/input";
import { Bell, Box } from "lucide-react";
import notificationsApi, { Notification } from "@/lib/notifications-api";
import { formatDistanceToNow } from "date-fns";

export default function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const [userImage, setUserImage] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProject = navData.navMain.find((item) => item.url === pathname);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      const payload = res.data as any;
      const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
      setNotifications(items);
    } catch {
      // silently fail
    }
  }, []);

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
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
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
            className="w-7.5 h-7.5 relative rounded-[5px] bg-[#F5F5F5] flex justify-center items-center cursor-pointer hover:bg-[#EBEBEB] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 z-50 w-[360px] bg-white border border-[#E6E6E6] rounded-[8px] shadow-lg overflow-hidden">
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
                {notifications.length === 0 ? (
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
                          title="Mark as read"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-7.5 h-7.5 relative rounded-[5px] bg-[#F5F5F5] overflow-hidden">
          <Image
            src={userImage || userAvatar}
            alt="Preview"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    </header>
  );
}
