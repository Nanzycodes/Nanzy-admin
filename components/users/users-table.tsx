"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ListFilter, Calendar, ChevronDown } from "lucide-react";
import { User, UserRole } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface UsersTableProps {
  roleFilter: UserRole | "all";
  onViewDetails: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const COLUMN_LABEL: Record<UserRole | "all", string> = {
  all: "User ID",
  user: "User ID",
  seller: "Sellers ID",
  delivery_partner: "Delivery Partner ID",
};

const MOCK_USERS: User[] = [
  { id: "PL-0001", name: "Olamade Lamina", email: "OlamadeLamina@gmail.com", date_joined: "01-04-2025", status: "active", role: "user" },
  { id: "PL-0006", name: "Olamade Lamina", email: "OlamadeLamina@gmail.com", date_joined: "01-04-2025", status: "active", role: "seller" },
  { id: "PL-0011", name: "Olamade Lamina", email: "OlamadeLamina@gmail.com", date_joined: "01-04-2025", status: "active", role: "delivery_partner" },
];

const ITEMS_PER_PAGE = 5;

// ── Safe parser for dd-mm-yyyy → Date
function parseUserDate(dateStr: string): Date | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const d = new Date(`${year}-${month}-${day}`);
  return isNaN(d.getTime()) ? null : d;
}

export default function UsersTable({
  roleFilter,
  onViewDetails,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fromPickerRef = useRef<HTMLDivElement>(null);
  const toPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setCurrentPage(1), [roleFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromPickerRef.current && !fromPickerRef.current.contains(event.target as Node)) setShowFromPicker(false);
      if (toPickerRef.current && !toPickerRef.current.contains(event.target as Node)) setShowToPicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Filter users
  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const userDate = parseUserDate(user.date_joined);

    let matchesFrom = true;
    let matchesTo = true;

    if (userDate) {
      if (fromDate instanceof Date) matchesFrom = userDate.getTime() >= fromDate.getTime();
      if (toDate instanceof Date) matchesTo = userDate.getTime() <= toDate.getTime();
    } else {
      matchesFrom = false;
      matchesTo = false;
    }

    return matchesRole && matchesSearch && matchesFrom && matchesTo;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="relative flex-1 max-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 h-9 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 h-9 hover:bg-muted transition-colors">
          <ListFilter size={13} />
          Filter
        </button>

        {/* Date From */}
        <div ref={fromPickerRef} className="relative ml-auto">
          <button onClick={() => setShowFromPicker(v => !v)} className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 h-9 hover:bg-muted transition-colors">
            <Calendar size={13} /> Date from <ChevronDown size={13} />
          </button>
          {showFromPicker && (
            <div className="absolute z-50 mt-1">
              <DatePicker
                selected={fromDate}
                onChange={(date:Date|null) => { setFromDate(date); setShowFromPicker(false); setCurrentPage(1); }}
                maxDate={toDate || undefined}
                inline
              />
            </div>
          )}
        </div>

        {/* Date To */}
        <div ref={toPickerRef} className="relative">
          <button onClick={() => setShowToPicker(v => !v)} className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 h-9 hover:bg-muted transition-colors">
            <Calendar size={13} /> Date to <ChevronDown size={13} />
          </button>
          {showToPicker && (
            <div className="absolute z-50 mt-1">
              <DatePicker
                selected={toDate}
                onChange={(date:Date|null) => { setToDate(date); setShowToPicker(false); setCurrentPage(1); }}
                minDate={fromDate || undefined}
                inline
              />
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">{COLUMN_LABEL[roleFilter]}</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email address</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Date joined</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td></tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex shrink-0">
                        <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
                        <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">#{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground text-right">{user.date_joined}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center hover:opacity-70 transition-opacity">
                          <span className="w-2 h-2 rounded-full border border-muted-foreground/40" />
                          <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
                          <span className="w-2 h-2 rounded-full border border-muted-foreground/40 -ml-px" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onViewDetails(user)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 text-sm"
          >
            ← Previous
          </button>

          {getPageNumbers().map((page, i) =>
            page === "..." ? <span key={`dots-${i}`} className="px-1 text-muted-foreground">...</span> :
            <button
              key={page}
              onClick={() => setCurrentPage(page as number)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted border border-transparent hover:border-border"}`}
            >
              {page}
            </button>
          )}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 text-sm"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status badge ──
function StatusBadge({ status }: { status: User["status"] }) {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-200",
    suspended: "bg-red-50 text-red-600 border-red-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}