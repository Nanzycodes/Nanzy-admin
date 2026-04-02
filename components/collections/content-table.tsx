"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ListFilter,
  Calendar,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";

const ThreeDots = () => (
  <div className="flex items-center gap-px">
    <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground/50" />
    <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground/50" />
    <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground/50" />
  </div>
);
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import apiClient from "@/lib/apiclient";
import { ContentType, CONTENT_TYPE_LABELS } from "@/types/collection";
import ContentDetailModal from "@/components/collections/content-detail-modal";

type TabFilter = "all" | "approved" | "flagged";

interface ContentRow {
  id: string | number;
  content_type: ContentType;
  title: string;
  creator_name: string;
  created_at: string;
  status: string | null;
}

interface ContentTableProps {
  tab: TabFilter;
}

const FILTER_TYPES: { label: string; value: ContentType }[] = [
  { label: "Video", value: "video" },
  { label: "Article", value: "article" },
  { label: "Livestream", value: "livestream" },
  { label: "Influencer", value: "influencer_content" },
];

const CONTENT_TYPE_BADGE: Record<ContentType, string> = {
  video: "bg-[#ECEBFF] text-[#635BFF]",
  article: "bg-[#FFF3E0] text-[#E65100]",
  livestream: "bg-[#E8F5E9] text-[#2E7D32]",
  influencer_content: "bg-[#FCE4EC] text-[#AD1457]",
};

function getStatusBadge(status: string | null) {
  if (!status) return "bg-[#F5F5F5] text-[#9E9E9E] border-[#E0E0E0]";
  const s = status.toLowerCase();
  if (s === "approved") return "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]";
  if (s === "flagged") return "bg-[#FCE4EC] text-[#AD1457] border-[#F48FB1]";
  return "bg-[#FFF9C4] text-[#F57F17] border-[#FFF176]";
}

function extractRow(item: any): ContentRow {
  let title = "—";
  let creator = "—";

  if (item.content_type === "article") {
    title = item.title || "—";
    creator = item.author_name || "—";
  } else if (item.content_type === "livestream") {
    title = item.name || "—";
    creator = item.creator_name || "—";
  } else {
    // video / influencer_content
    title = item.caption || "—";
    creator = item.creator_name || "—";
  }

  return {
    id: item.id,
    content_type: item.content_type as ContentType,
    title,
    creator_name: creator,
    created_at: item.created_at,
    status: item.status ?? null,
  };
}

const ITEMS_PER_PAGE = 7;

export default function ContentTable({ tab }: ContentTableProps) {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ContentType | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [openActionId, setOpenActionId] = useState<string | number | null>(null);
  const [detailItem, setDetailItem] = useState<{ id: string | number; content_type: ContentType } | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
      if (actionRef.current && !actionRef.current.contains(e.target as Node))
        setOpenActionId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setRows([]);
  }, [tab, search, filterType, dateFrom, dateTo]);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("page", String(currentPage));
        params.append("page_size", String(ITEMS_PER_PAGE));
        if (filterType) params.append("content_type", filterType);
        if (search) params.append("search", search);
        if (dateFrom) params.append("start_date", format(dateFrom, "yyyy-MM-dd"));
        if (dateTo) params.append("end_date", format(dateTo, "yyyy-MM-dd"));
        // Pass tab as status filter if not "all"
        if (tab !== "all") params.append("status", tab);

        const res = await apiClient.get(`/admin/content/?${params.toString()}`);
        // Response: { success, message, data: { count, next, previous, results } }
        const data = res.data?.data;
        const results: any[] = data?.results ?? [];

        setRows(results.map(extractRow));
        setTotalCount(data?.count ?? results.length);
      } catch {
        setError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [tab, currentPage, search, filterType, dateFrom, dateTo]);

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
    <>
      <div className="bg-white rounded-xl border border-border">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <div className="relative flex-[2] min-w-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
              />
              <input
                placeholder="Search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 h-9 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="relative flex-[1]" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="w-full flex items-center justify-center gap-2 h-9 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                <ListFilter size={14} />
                {filterType ? CONTENT_TYPE_LABELS[filterType] : "Filter"}
                {filterType && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setFilterType(null); }}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </span>
                )}
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[140px]">
                  {FILTER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setFilterType(t.value); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                        filterType === t.value ? "text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex-1 flex items-center justify-center gap-2 h-9 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                  <Calendar size={14} />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Date from"}
                  <ChevronDown size={12} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex-1 flex items-center justify-center gap-2 h-9 px-3 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                  <Calendar size={14} />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Date to"}
                  <ChevronDown size={12} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-border" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Seller ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Content type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Submission date</th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th> */}
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-red-500 text-sm">{error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No content found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const dateStr = (() => {
                    try { return format(new Date(row.created_at), "dd-MM-yyyy"); }
                    catch { return row.created_at; }
                  })();
                  const key = `${row.content_type}-${row.id}`;
                  const statusLabel = row.status
                    ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
                    : "—";
                  return (
                    <tr
                      key={key}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded border-border" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-sm">{row.creator_name}</p>
                        <p className="text-xs text-muted-foreground">#{String(row.id).slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${CONTENT_TYPE_BADGE[row.content_type] ?? "bg-muted text-muted-foreground"}`}>
                          {CONTENT_TYPE_LABELS[row.content_type] ?? row.content_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground max-w-[180px]">
                        <span className="truncate block">
                          {row.title.length > 28 ? `${row.title.slice(0, 28)}...` : row.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{dateStr}</td>
                      {/* <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getStatusBadge(row.status)}`}>
                          {statusLabel}
                        </span>
                      </td> */}
                      <td className="px-4 py-3">
                        <div
                          className="relative inline-block"
                          ref={openActionId === row.id ? actionRef : null}
                        >
                          <button
                            onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)}
                            className="flex items-center hover:opacity-70 transition-opacity"
                          >
                            <ThreeDots />
                          </button>
                          {openActionId === row.id && (
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-[130px]">
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  setDetailItem({ id: row.id, content_type: row.content_type });
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
                <span key={`ellipsis-${i}`} className="w-8 text-center text-sm text-muted-foreground">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
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

      {detailItem && (
        <ContentDetailModal
          contentType={detailItem.content_type}
          contentId={detailItem.id}
          onClose={() => setDetailItem(null)}
        />
      )}
    </>
  );
}
