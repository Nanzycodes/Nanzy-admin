"use client";

import { useState } from "react";
import { Search, AlignJustify, ArrowUpRight, Box } from "lucide-react";

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    message: "Nim Storeshas failed logins attempt",
    time: "5mins ago",
    read: false,
  },
  {
    id: "2",
    message: "You just assigned an order to Speed los",
    time: "5mins ago",
    read: false,
  },
  {
    id: "3",
    message: "You just assigned an order to Speed los",
    time: "5mins ago",
    read: false,
  },
  {
    id: "4",
    message: "You just assigned an order to Speed los",
    time: "5mins ago",
    read: false,
  },
];

const Notifications = () => {
  const [search, setSearch] = useState("");
  const [allRead, setAllRead] = useState(false);

  const filtered = MOCK_NOTIFICATIONS.filter((n) =>
    n.message.toLowerCase().includes(search.toLowerCase()),
  );

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

        <button className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-[#E6E6E6] bg-white cursor-pointer hover:bg-[#F5F5F5] transition-colors">
          <AlignJustify size={15} className="text-[#616161]" />
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-[5px] border border-[#E6E6E6] bg-white cursor-pointer hover:bg-[#F5F5F5] transition-colors">
          <ArrowUpRight size={15} className="text-[#616161]" />
        </button>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allRead}
            onChange={(e) => setAllRead(e.target.checked)}
            className="w-4 h-4 rounded border-[#E6E6E6] accent-[#635BFF] cursor-pointer"
          />
          <span className="text-sm font-medium text-[#212121]">
            Mark all as read
          </span>
        </label>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#9E9E9E]">
            No notifications
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 py-5 border-b border-[#F5F5F5] last:border-0"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-[#ECEBFF] flex items-center justify-center shrink-0">
                <Box size={18} className="text-[#635BFF]" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-medium text-[#212121]">
                  {item.message}
                </p>
                <p className="text-xs text-[#9E9E9E] mt-0.5">{item.time}</p>
              </div>

              {/* Action */}
              <button className="px-5 py-2 text-sm font-medium text-[#645CFF] rounded-lg border border-[] bg-[#ECEBFF] hover:bg-[#FAFAFE] transition-colors cursor-pointer whitespace-nowrap">
                View details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
