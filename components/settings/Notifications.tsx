"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, AlignJustify, ArrowUpRight, Box } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import notificationsApi, { Notification } from "@/lib/notifications-api";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      const payload = res.data as any;
      const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
      setNotifications(items);
    } catch {
      // silently fail — keep empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
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

  const filtered = notifications.filter((n) =>
    `${n.title} ${n.message}`.toLowerCase().includes(search.toLowerCase()),
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
          />
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 text-sm border border-[#E6E6E6] rounded-full bg-[#F5F5F5] text-[#212121] placeholder:text-[#9E9E9E] focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
          />
        </div>

        {/* <button className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-[#E6E6E6] bg-white cursor-pointer hover:bg-[#F5F5F5] transition-colors">
          <AlignJustify size={15} className="text-[#616161]" />
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-[#E6E6E6] bg-white cursor-pointer hover:bg-[#F5F5F5] transition-colors">
          <ArrowUpRight size={15} className="text-[#616161]" />
        </button> */}

        {unreadCount > 0 && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={false}
              onChange={handleMarkAllRead}
              disabled={markingAll}
              className="w-4 h-4 rounded border-[#E6E6E6] accent-[#635BFF] cursor-pointer"
            />
            <span className="text-sm font-medium text-[#212121] whitespace-nowrap">
              Mark all as read{unreadCount > 0 ? ` (${unreadCount})` : ""}
            </span>
          </label>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col">
        {loading ? (
          <p className="py-12 text-center text-sm text-[#9E9E9E]">
            Loading notifications…
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#9E9E9E]">
            No notifications
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 py-5 border-b border-[#F5F5F5] last:border-0 ${
                !item.is_read ? "bg-[#FAFAFE]" : ""
              }`}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-[#ECEBFF] flex items-center justify-center shrink-0">
                <Box size={18} className="text-[#635BFF]" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                {item.title && (
                  <p className="text-xs font-semibold text-[#635BFF] mb-0.5 uppercase tracking-wide">
                    {item.title}
                  </p>
                )}
                <p className="text-sm font-medium text-[#212121]">
                  {item.message}
                </p>
                <p className="text-xs text-[#9E9E9E] mt-0.5">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Action */}
              {!item.is_read && (
                <button
                  onClick={() => handleMarkAsRead(item.id)}
                  className="px-5 py-2 text-sm font-medium text-[#645CFF] rounded-lg border border-[] bg-[#ECEBFF] hover:bg-[#FAFAFE] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
