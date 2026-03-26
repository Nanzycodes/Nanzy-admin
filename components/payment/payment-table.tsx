"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ListFilter,
  Calendar,
  ChevronDown,
  X,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import {
  Transaction,
  TransactionStatus,
  TRANSACTION_STATUS_LABEL,
  formatTransactionType,
} from "@/types/payout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import apiClient from "@/lib/apiclient";

interface PaymentTableProps {
  onViewDetails: (transaction: Transaction) => void;
}

const FILTER_STATUSES: { label: string; value: TransactionStatus }[] = [
  { label: "Paid", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const ITEMS_PER_PAGE = 7;

export default function PaymentTable({ onViewDetails }: PaymentTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<TransactionStatus | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [search, filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("page", String(currentPage));
        params.append("page_size", String(ITEMS_PER_PAGE));

        const response = await apiClient.get(
          `/admin/transactions/?${params.toString()}`
        );
        const payload = response.data?.data;

        if (payload?.results) {
          setTransactions(payload.results);
          setTotalCount(payload.count);
        } else {
          setTransactions([]);
          setTotalCount(0);
        }
      } catch {
        setError("Failed to load transactions. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [currentPage, search, filterStatus, dateFrom, dateTo]);

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

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedRows.size === transactions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(transactions.map((t) => t.id)));
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
          />
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 h-9 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Filter */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-2 h-9 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            <ListFilter size={14} />
            {filterStatus
              ? FILTER_STATUSES.find((s) => s.value === filterStatus)?.label
              : "Filter"}
            {filterStatus && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterStatus(null);
                }}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </span>
            )}
          </button>
          {filterOpen && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[140px]">
              {FILTER_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    setFilterStatus(s.value);
                    setFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                    filterStatus === s.value
                      ? "text-primary font-medium"
                      : "text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date from */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 h-9 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors">
              <Calendar size={14} />
              {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Date from"}
              <ChevronDown size={12} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date to */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 h-9 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors">
              <Calendar size={14} />
              {dateTo ? format(dateTo, "dd/MM/yyyy") : "Date to"}
              <ChevronDown size={12} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    transactions.length > 0 &&
                    selectedRows.size === transactions.length
                  }
                  onChange={toggleAll}
                  className="rounded border-border"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Wallet ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Requested on
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 size={20} className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-red-500 text-sm">
                  {error}
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const formattedDate = (() => {
                  try {
                    return format(new Date(tx.created_at), "dd-MM-yyyy");
                  } catch {
                    return tx.created_at;
                  }
                })();
                const amount = parseFloat(tx.amount);
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(tx.id)}
                        onChange={() => toggleRow(tx.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-xs font-mono">
                        {tx.wallet_id.slice(0, 8)}…
                      </p>
                      <p className="text-xs text-muted-foreground">#{tx.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      ₦{isNaN(amount) ? tx.amount : amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatTransactionType(tx.transaction_type)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{formattedDate}</td>
                    <td className="px-4 py-3">
                      <TransactionStatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="relative inline-block"
                        ref={openActionId === tx.id ? actionRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenActionId(openActionId === tx.id ? null : tx.id)
                          }
                          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openActionId === tx.id && (
                          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[130px]">
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                onViewDetails(tx);
                              }}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                            >
                              View details
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 text-sm"
          >
            ← Previous
          </button>
          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 text-center text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors
                  ${
                    currentPage === page
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
            className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 text-sm"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const styles: Record<TransactionStatus, string> = {
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-orange-50 text-orange-600 border-orange-200",
    FAILED: "bg-red-50 text-red-600 border-red-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${styles[status]}`}
    >
      {TRANSACTION_STATUS_LABEL[status]}
    </span>
  );
}
