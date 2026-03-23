"use client";

// components/orders/orders-table.tsx

import React, { useState, useEffect, useRef } from "react";
import { Search, ListFilter, Calendar, ChevronDown, TrendingUp, X, Loader2 } from "lucide-react";
import { Order, OrderStatus, OrderDetail, STATUS_LABELS } from "@/types/order";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import apiClient from "@/lib/apiclient";

interface OrdersTableProps {
  onViewDetails: (order: OrderDetail) => void;
}

// ── Tabs ──
const TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All orders", value: "all" },
  { label: "Orders delivered", value: "DELIVERED" },
  { label: "Orders in transit", value: "IN_TRANSIT" },
];

// ── Filter status options ──
const FILTER_STATUSES: { label: string; value: OrderStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "In-transit", value: "IN_TRANSIT" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const ITEMS_PER_PAGE = 7;

export default function OrdersTable({ onViewDetails }: OrdersTableProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filter state ──
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // ── Date state ──
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // ── Close filter dropdown when clicking outside ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Reset page when filters change ──
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, filterStatus, dateFrom, dateTo]);

  // ── Fetch orders from API ──
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("page", String(currentPage));
        params.append("page_size", String(ITEMS_PER_PAGE));
        if (search) params.append("search", search);
        if (filterStatus) params.append("status", filterStatus);
        else if (activeTab !== "all") params.append("status", activeTab);
        if (dateFrom) params.append("created_after", format(dateFrom, "yyyy-MM-dd"));
        if (dateTo) params.append("created_before", format(dateTo, "yyyy-MM-dd"));

        const response = await apiClient.get(
  `/admin/orders/?${params.toString()}`
);

// Handle both paginated and non-paginated responses
const data = response.data;
if (data.results) {
  // Paginated response: { count, results: [...] }
  setOrders(data.results);
  setTotalCount(data.count);
} else if (Array.isArray(data)) {
  // Direct array response: [...]
  setOrders(data);
  setTotalCount(data.length);
} else {
  setOrders([]);
  setTotalCount(0);
}} catch (err) {
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentPage, activeTab, search, filterStatus, dateFrom, dateTo]);

  // ── Fetch single order detail and open modal ──
  async function handleViewDetails(order: Order) {
    try {
      const response = await apiClient.get(
        `/admin/orders/${order.id}/`
      );
      onViewDetails(response.data);
    } catch (err) {
      alert("Could not load order details. Please try again.");
    }
  }

  // ── Update order status ──
  async function handleStatusUpdate(orderId: string, newStatus: OrderStatus) {
    try {
      await apiClient.patch(
        `/admin/orders/${orderId}/`,
        { status: newStatus }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Could not update order status. Please try again.");
    }
  }

  // ── Delete order ──
  async function handleDeleteOrder(orderId: string) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await apiClient.delete(`/admin/orders/${orderId}/delete/`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      alert("Could not cancel order. Please try again.");
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div>
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M1.6875 4.87496V12.8709C1.6875 13.7112 2.3005 14.2701 3.055 14.7228C3.81879 15.1812 5.10077 15.7227 6.5206 16.3224C7.5849 16.7724 8.271 17.0625 9 17.0625C9.729 17.0625 10.4151 16.7724 11.4794 16.3225C12.8991 15.7228 14.1812 15.1812 14.945 14.7228C15.6995 14.2701 16.3125 13.7112 16.3125 12.8709V4.87496C16.3125 4.73221 16.2593 4.60187 16.1717 4.50269L13.7015 5.70201L11.5105 6.76217C10.1097 7.44004 9.5682 7.68746 9 7.68746C8.4318 7.68746 7.8903 7.44004 6.48945 6.76217L4.29855 5.70201L1.82831 4.50269C1.74068 4.60187 1.6875 4.73221 1.6875 4.87496ZM4.75168 8.49679C4.47382 8.35781 4.13594 8.47046 3.997 8.74834C3.85807 9.02621 3.9707 9.36409 4.24856 9.50299L5.74856 10.253C6.02643 10.3919 6.36431 10.2793 6.50324 10.0014C6.64217 9.72356 6.52955 9.38569 6.25168 9.24679L4.75168 8.49679Z" fill="#635bff"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 0.9375C8.12063 0.9375 7.31663 1.31887 6.14316 1.87549L3.80909 2.98129C3.26552 3.23874 2.78625 3.46574 2.44906 3.68872C2.11145 3.91197 1.6875 4.27815 1.6875 4.875C1.6875 5.47185 2.11145 5.83803 2.44906 6.06128C2.78624 6.28426 3.26551 6.51125 3.80907 6.7687L6.14317 7.87448C7.31663 8.43113 8.12063 8.8125 9 8.8125C9.87938 8.8125 10.6834 8.43113 11.8568 7.87448L14.1909 6.76872C14.7345 6.51127 15.2137 6.28427 15.551 6.06128C15.8885 5.83803 16.3125 5.47185 16.3125 4.875C16.3125 4.27815 15.8885 3.91197 15.551 3.68872C15.2137 3.46574 14.7345 3.23873 14.1909 2.98128L11.8568 1.87549C10.6834 1.31887 9.87938 0.9375 9 0.9375ZM6.6319 3.23549C8.0136 2.58093 8.4978 2.37012 9.00008 2.37012C9.45983 2.37012 9.90442 2.54676 11.0362 3.0787L5.30152 5.88586L4.49577 5.50415C3.88774 5.21611 3.50683 5.03362 3.26806 4.87579C3.50683 4.71797 3.88774 4.53549 4.49577 4.24745L6.6319 3.23549ZM6.96396 6.6729L12.6986 3.86573L13.5044 4.24745C14.1124 4.53549 14.4933 4.71797 14.732 4.87579C14.4933 5.03362 14.1124 5.21611 13.5044 5.50415L11.3682 6.51611C9.98655 7.17067 9.50235 7.38148 9.00008 7.38148C8.54025 7.38148 8.09565 7.20484 6.96396 6.6729Z" fill="#635bff"/>
              </svg>
            </div>
          }
          label="Total orders"
          value={String(totalCount)}
          trend="9%"
        />
        <StatCard
          icon={
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M1.6875 4.87496V12.8709C1.6875 13.7112 2.3005 14.2701 3.055 14.7228C3.81879 15.1812 5.10077 15.7227 6.5206 16.3224C7.5849 16.7724 8.271 17.0625 9 17.0625C9.729 17.0625 10.4151 16.7724 11.4794 16.3225C12.8991 15.7228 14.1812 15.1812 14.945 14.7228C15.6995 14.2701 16.3125 13.7112 16.3125 12.8709V4.87496C16.3125 4.73221 16.2593 4.60187 16.1717 4.50269L13.7015 5.70201L11.5105 6.76217C10.1097 7.44004 9.5682 7.68746 9 7.68746C8.4318 7.68746 7.8903 7.44004 6.48945 6.76217L4.29855 5.70201L1.82831 4.50269C1.74068 4.60187 1.6875 4.73221 1.6875 4.87496ZM4.75168 8.49679C4.47382 8.35781 4.13594 8.47046 3.997 8.74834C3.85807 9.02621 3.9707 9.36409 4.24856 9.50299L5.74856 10.253C6.02643 10.3919 6.36431 10.2793 6.50324 10.0014C6.64217 9.72356 6.52955 9.38569 6.25168 9.24679L4.75168 8.49679Z" fill="#F59E0B"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 0.9375C8.12063 0.9375 7.31663 1.31887 6.14316 1.87549L3.80909 2.98129C3.26552 3.23874 2.78625 3.46574 2.44906 3.68872C2.11145 3.91197 1.6875 4.27815 1.6875 4.875C1.6875 5.47185 2.11145 5.83803 2.44906 6.06128C2.78624 6.28426 3.26551 6.51125 3.80907 6.7687L6.14317 7.87448C7.31663 8.43113 8.12063 8.8125 9 8.8125C9.87938 8.8125 10.6834 8.43113 11.8568 7.87448L14.1909 6.76872C14.7345 6.51127 15.2137 6.28427 15.551 6.06128C15.8885 5.83803 16.3125 5.47185 16.3125 4.875C16.3125 4.27815 15.8885 3.91197 15.551 3.68872C15.2137 3.46574 14.7345 3.23873 14.1909 2.98128L11.8568 1.87549C10.6834 1.31887 9.87938 0.9375 9 0.9375ZM6.6319 3.23549C8.0136 2.58093 8.4978 2.37012 9.00008 2.37012C9.45983 2.37012 9.90442 2.54676 11.0362 3.0787L5.30152 5.88586L4.49577 5.50415C3.88774 5.21611 3.50683 5.03362 3.26806 4.87579C3.50683 4.71797 3.88774 4.53549 4.49577 4.24745L6.6319 3.23549ZM6.96396 6.6729L12.6986 3.86573L13.5044 4.24745C14.1124 4.53549 14.4933 4.71797 14.732 4.87579C14.4933 5.03362 14.1124 5.21611 13.5044 5.50415L11.3682 6.51611C9.98655 7.17067 9.50235 7.38148 9.00008 7.38148C8.54025 7.38148 8.09565 7.20484 6.96396 6.6729Z" fill="#F59E0B"/>
              </svg>
            </div>
          }
          label="Orders in transit"
          value={String((orders ?? []).filter((o) => o.status === "IN_TRANSIT").length)}
          trend="4%"
        />
        <StatCard
          icon={
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M15.1738 1.6875C15.4335 1.68748 15.6689 1.68746 15.8625 1.70695C16.0701 1.72785 16.2962 1.77606 16.5047 1.91828C16.6726 2.03286 16.8121 2.18474 16.9116 2.36248C17.0356 2.58411 17.0621 2.81441 17.0625 3.02263C17.0629 3.21587 17.0393 3.4481 17.0135 3.70272C16.969 4.14197 16.9265 4.56233 16.8673 4.86078C16.805 5.17449 16.7097 5.46301 16.5181 5.72135C16.3504 5.94742 16.1383 6.1369 15.8947 6.27857C15.6173 6.43996 15.3197 6.50438 14.9993 6.53414C14.6936 6.56252 14.3193 6.56252 13.8715 6.5625H4.12844C3.6807 6.56252 3.30635 6.56252 3.00069 6.53414C2.68031 6.50438 2.38263 6.43996 2.10523 6.27857C1.86174 6.1369 1.64953 5.94742 1.48186 5.72135C1.29027 5.46301 1.19494 5.17449 1.13271 4.86078C1.0735 4.56233 1.03095 4.142 0.986472 3.70274C0.960665 3.44811 0.937122 3.21587 0.937505 3.02263C0.93791 2.81441 0.964355 2.58411 1.0884 2.36248C1.18788 2.18474 1.32732 2.03286 1.49527 1.91828C1.70373 1.77606 1.92988 1.72785 2.13753 1.70695C2.3311 1.68746 2.56647 1.68748 2.82623 1.6875H15.1738Z" fill="#22C55E"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M2.41875 5.4375C2.82261 5.4375 3.15 5.76209 3.15 6.1625V9.81713C3.15 11.1978 3.15157 12.16 3.2505 12.8858C3.34655 13.5905 3.52203 13.963 3.79121 14.2285C4.06091 14.4945 4.44007 14.6683 5.15618 14.7633C5.89295 14.861 6.86933 14.8625 8.26875 14.8625H9.73125C11.1307 14.8625 12.107 14.861 12.8438 14.7633C13.5599 14.6683 13.9391 14.4945 14.2088 14.2285C14.478 13.963 14.6534 13.5905 14.7495 12.8858C14.8484 12.16 14.85 11.1978 14.85 9.81713V6.1625C14.85 5.76209 15.1774 5.4375 15.5812 5.4375C15.9851 5.4375 16.3125 5.76209 16.3125 6.1625V9.87037C16.3125 11.1852 16.3125 12.2458 16.1988 13.08C16.0807 13.9468 15.8279 14.6769 15.2403 15.2564C14.6533 15.8354 13.9147 16.0842 13.0377 16.2004C12.1927 16.3125 11.1182 16.3125 9.7845 16.3125H8.2155C6.88189 16.3125 5.80733 16.3125 4.96228 16.2004C4.08536 16.0842 3.34673 15.8354 2.75972 15.2564C2.17219 14.6769 1.91932 13.9468 1.80118 13.08C1.68746 12.2458 1.68748 11.1852 1.6875 9.87037V6.1625C1.6875 5.76209 2.01489 5.4375 2.41875 5.4375Z" fill="#22C55E"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M6.75 8.25C6.75 7.83578 7.08579 7.5 7.5 7.5H10.5C10.9142 7.5 11.25 7.83578 11.25 8.25C11.25 8.66422 10.9142 9 10.5 9H7.5C7.08579 9 6.75 8.66422 6.75 8.25Z" fill="#22C55E"/>
              </svg>
            </div>
          }
          label="Orders delivered"
          value={String((orders ?? []).filter((o) => o.status === "DELIVERED").length)}
          trend="5%"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl border border-border">
        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {/* Search */}
          <div className="relative flex-1 max-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 h-9 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring relative z-0"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              className={`flex items-center gap-2 text-sm border rounded-md px-3 h-9 transition-colors
                ${filterStatus ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:bg-muted"}`}
            >
              <ListFilter size={13} />
              {filterStatus ? STATUS_LABELS[filterStatus] : "Filter"}
              {filterStatus ? (
                <X size={12} onClick={(e) => { e.stopPropagation(); setFilterStatus(null); }} className="ml-1 hover:opacity-70" />
              ) : (
                <ChevronDown size={13} />
              )}
            </button>
            {filterOpen && (
              <div className="absolute top-10 left-0 z-50 bg-white border border-border rounded-md shadow-md w-44 py-1">
                {FILTER_STATUSES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => { setFilterStatus(f.value); setFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors
                      ${filterStatus === f.value ? "text-primary font-medium" : "text-foreground"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <button className={`ml-auto flex items-center gap-2 text-sm border rounded-md px-3 h-9 transition-colors
                ${dateFrom ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:bg-muted"}`}>
                <Calendar size={13} />
                {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Date from"}
                {dateFrom ? (
                  <X size={12} onClick={(e) => { e.stopPropagation(); setDateFrom(undefined); }} className="ml-1 hover:opacity-70" />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={dateFrom} onSelect={(date) => setDateFrom(date)} initialFocus />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <button className={`flex items-center gap-2 text-sm border rounded-md px-3 h-9 transition-colors
                ${dateTo ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:bg-muted"}`}>
                <Calendar size={13} />
                {dateTo ? format(dateTo, "dd/MM/yyyy") : "Date to"}
                {dateTo ? (
                  <X size={12} onClick={(e) => { e.stopPropagation(); setDateTo(undefined); }} className="ml-1 hover:opacity-70" />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={dateTo} onSelect={(date) => setDateTo(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Items</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted-foreground/20 shrink-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {order.customer?.charAt(0) ?? "?"}
                        </div>
                        <p className="font-medium text-foreground">{order.customer}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.customer_email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.items_count}</td>
                    <td className="px-4 py-3 text-foreground">₦{Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center hover:opacity-70 transition-opacity">
                            <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
                            <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
                            <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "IN_TRANSIT")}>
                            Mark as In-transit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "DELIVERED")}>
                            Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, "REJECTED")}
                            className="text-destructive focus:text-destructive">
                            Mark as Rejected
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-destructive focus:text-destructive">
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40"
            >
              ← Previous
            </button>
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span key={`dots-${i}`} className="px-1">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors
                    ${currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted border border-transparent hover:border-border"
                    }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ──
function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>{icon}</div>
        <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
          This Week <ChevronDown size={11} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <span className="text-xs text-green-700 font-medium flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
          <TrendingUp size={11} className="text-green-700" />
          {trend}
        </span>
      </div>
    </div>
  );
}

// ── Status badge ──
function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    IN_TRANSIT: "bg-green-50 text-green-700 border-green-200",
    DELIVERED: "bg-purple-50 text-purple-700 border-purple-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
    PENDING: "bg-orange-50 text-orange-600 border-orange-200",
    CANCELLED: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}