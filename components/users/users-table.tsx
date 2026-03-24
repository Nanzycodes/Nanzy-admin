"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ListFilter, Calendar, ChevronDown, Loader2, X } from "lucide-react";
import { User, UserRole, UserStatus } from "@/types/user";
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

interface UsersTableProps {
  roleFilter: UserRole | "all";
  onViewDetails: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const ITEMS_PER_PAGE = 7;

const FILTER_STATUSES: { label: string; value: UserStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Inactive", value: "inactive" },
];

const COLUMN_LABEL: Record<UserRole | "all", string> = {
  all: "User ID",
  user: "User ID",
  seller: "Seller ID",
  influencer: "Influencer ID",
};

export default function UsersTable({
  roleFilter,
  onViewDetails,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<UserStatus | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, search, filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("page", String(currentPage));
        params.append("page_size", String(ITEMS_PER_PAGE));
        if (search) params.append("search", search);
        if (filterStatus) params.append("status", filterStatus);
        if (dateFrom) params.append("start_date", format(dateFrom, "yyyy-MM-dd"));
        if (dateTo) params.append("end_date", format(dateTo, "yyyy-MM-dd"));

        let url = "/admin/customers/?";
        if (roleFilter === "seller") {
          url = "/admin/sellers/?";
        }

        const response = await apiClient.get(`${url}${params.toString()}`);
        const data = response.data;

        if (data.data?.results) {
          const mapped: User[] = data.data.results.map((u: any) => ({
            ...u,
            name: `${u.first_name} ${u.last_name}`.trim() || u.email,
            role: roleFilter === "seller" ? "seller" : u.role ?? "user",
          }));
          setUsers(mapped);
          setTotalCount(data.data.count);
        } else {
          setUsers([]);
          setTotalCount(0);
        }
      } catch {
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [currentPage, roleFilter, search, filterStatus, dateFrom, dateTo]);

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
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="relative flex-1 max-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 h-9 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={`flex items-center gap-2 text-sm border rounded-md px-3 h-9 transition-colors
              ${filterStatus ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:bg-muted"}`}
          >
            <ListFilter size={13} />
            {filterStatus ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1) : "Filter"}
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{COLUMN_LABEL[roleFilter]}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email address</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date joined</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-red-500">{error}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.user_id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 flex items-center justify-center text-xs font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground leading-tight">{user.name}</p>
                        <p className="text-xs text-muted-foreground leading-tight">#{user.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(() => {
                      const d = new Date(user.date_joined);
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-1 hover:opacity-70 transition-opacity">
                          <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
                          <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
                          <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onViewDetails(user)}>View Details</DropdownMenuItem>
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
  );
}

function StatusBadge({ status }: { status: User["status"] }) {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    suspended: "bg-red-50 text-red-600 border-red-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    inactive: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${styles[status] ?? styles.inactive}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}