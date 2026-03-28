"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ListFilter,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  X,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface ColumnDef<T> {
  key: string;
  header: string;
  headerAlign?: "left" | "right" | "center";
  cellAlign?: "left" | "right" | "center";
  className?: string;
  cell: (row: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getSearchText: (item: T) => string;
  getDate?: (item: T) => Date | null;
  filterOptions?: FilterOption[];
  getFilterValue?: (item: T) => string;
  toolbarRight?: React.ReactNode;
  emptyMessage?: string;
  itemsPerPage?: number;
}

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const d = new Date(`${year}-${month}-${day}`);
  return isNaN(d.getTime()) ? null : d;
}

export { parseDate };

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export default function DataTable<T>({
  data,
  columns,
  getSearchText,
  getDate,
  filterOptions,
  getFilterValue,
  toolbarRight,
  emptyMessage = "No results found",
  itemsPerPage = 5,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const fromPickerRef = useRef<HTMLDivElement>(null);
  const toPickerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        fromPickerRef.current &&
        !fromPickerRef.current.contains(event.target as Node)
      )
        setShowFromPicker(false);
      if (
        toPickerRef.current &&
        !toPickerRef.current.contains(event.target as Node)
      )
        setShowToPicker(false);
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      )
        setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = data.filter((item) => {
    const matchesSearch = getSearchText(item)
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      !filterValue || !getFilterValue
        ? true
        : getFilterValue(item) === filterValue;

    if (!getDate) return matchesSearch && matchesFilter;

    const itemDate = getDate(item);
    let matchesFrom = true;
    let matchesTo = true;

    if (itemDate) {
      if (fromDate instanceof Date)
        matchesFrom = itemDate.getTime() >= fromDate.getTime();
      if (toDate instanceof Date)
        matchesTo = itemDate.getTime() <= toDate.getTime();
    } else {
      matchesFrom = false;
      matchesTo = false;
    }

    return matchesSearch && matchesFilter && matchesFrom && matchesTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[#E6E6E6]">
        {/* Search + Filter — flex-1 (left half) */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="relative flex-[2] min-w-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
            />
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-3 h-9 text-sm border border-[#E6E6E6] rounded-[5px] bg-white text-[#212121] placeholder:text-[#9E9E9E] focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
            />
          </div>

          <div className="relative flex-[1]" ref={filterRef}>
            <button
              onClick={() => filterOptions && setFilterOpen((o) => !o)}
              className="w-full h-9 flex items-center justify-center gap-2 rounded-[5px] border border-[#E6E6E6] bg-white cursor-pointer hover:bg-[#F5F5F5] transition-colors text-sm text-[#616161]"
            >
              <ListFilter size={15} className="text-[#616161]" />
              {filterValue && filterOptions
                ? filterOptions.find((o) => o.value === filterValue)?.label
                : "Filter"}
              {filterValue && (
                <span
                  onClick={(e) => { e.stopPropagation(); setFilterValue(null); }}
                  className="hover:text-[#212121]"
                >
                  <X size={12} />
                </span>
              )}
            </button>
            {filterOpen && filterOptions && (
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#E6E6E6] rounded-md shadow-lg py-1 min-w-[150px]">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilterValue(opt.value); setFilterOpen(false); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[#F5F5F5] transition-colors capitalize ${
                      filterValue === opt.value ? "text-[#635BFF] font-medium" : "text-[#424242]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates + toolbar right — flex-1 (right half) */}
        <div className="flex flex-1 items-center gap-2 justify-end">

        {/* Date From */}
        {getDate && (
          <div ref={fromPickerRef} className="relative flex-1">
            <button
              onClick={() => setShowFromPicker((v) => !v)}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#616161] border border-[#E6E6E6] rounded-[5px] bg-white px-3 h-9 hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <Calendar size={13} />
              <span className="hidden sm:inline">Date from</span>
              <ChevronDown size={13} />
            </button>
            {showFromPicker && (
              <div className="absolute z-50 mt-1 right-0 sm:right-auto">
                <DatePicker
                  selected={fromDate}
                  onChange={(date: Date | null) => {
                    setFromDate(date);
                    setShowFromPicker(false);
                    setCurrentPage(1);
                  }}
                  maxDate={toDate || undefined}
                  inline
                />
              </div>
            )}
          </div>
        )}

        {/* Date To */}
        {getDate && (
          <div ref={toPickerRef} className="relative flex-1">
            <button
              onClick={() => setShowToPicker((v) => !v)}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#616161] border border-[#E6E6E6] rounded-[5px] bg-white px-3 h-9 hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <Calendar size={13} />
              <span className="hidden sm:inline">Date to</span>
              <ChevronDown size={13} />
            </button>
            {showToPicker && (
              <div className="absolute z-50 mt-1 right-0">
                <DatePicker
                  selected={toDate}
                  onChange={(date: Date | null) => {
                    setToDate(date);
                    setShowToPicker(false);
                    setCurrentPage(1);
                  }}
                  minDate={fromDate || undefined}
                  inline
                />
              </div>
            )}
          </div>
        )}

        {toolbarRight && (
          <div className="flex items-center gap-2">
            {toolbarRight}
          </div>
        )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-3 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-muted-foreground ${ALIGN_CLASS[col.headerAlign ?? "left"]} ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-12 text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${ALIGN_CLASS[col.cellAlign ?? "left"]} ${col.className ?? ""}`}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 text-sm"
          >
            ← <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span key={`dots-${i}`} className="px-1 text-muted-foreground">
                  ...
                </span>
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
              ),
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 text-sm"
          >
            <span className="hidden sm:inline">Next</span> →
          </button>
        </div>
      </div>
    </div>
  );
}
