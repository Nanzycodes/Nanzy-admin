"use client";

import React, { useState, useEffect, useRef } from "react";
import InnerLayout from "@/components/inner-layout";
import PaymentTable from "@/components/payment/payment-table";
import { TrendingUp, ChevronDown } from "lucide-react";
import { TransactionOverview } from "@/types/payout";
import apiClient from "@/lib/apiclient";

type PayoutRole = "seller" | "influencer" | "delivery_partner";
type Timeframe = "weekly" | "monthly" | "yearly";

const TABS: { label: string; role: PayoutRole }[] = [
  { label: "Sellers", role: "seller" },
  { label: "Influencers", role: "influencer" },
  { label: "Delivery partner", role: "delivery_partner" },
];

const TIMEFRAME_OPTIONS: { label: string; value: Timeframe }[] = [
  { label: "This Week", value: "weekly" },
  { label: "This Month", value: "monthly" },
  { label: "This Year", value: "yearly" },
];

function TimeframeDropdown({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (v: Timeframe) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label = TIMEFRAME_OPTIONS.find((o) => o.value === value)?.label ?? "This Week";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1 hover:bg-muted transition-colors"
      >
        {label} <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-md shadow-lg py-1 min-w-30">
          {TIMEFRAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-muted ${
                value === opt.value ? "text-primary font-medium" : "text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState<PayoutRole>("seller");
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [overview, setOverview] = useState<TransactionOverview | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await apiClient.get(
          `/admin/transactions/overview/?timeframe=${timeframe}`
        );
        const payload = response.data?.data ?? response.data;
        if (payload) setOverview(payload);
      } catch {
        // best-effort
      }
    }
    fetchOverview();
  }, [timeframe]);

  function formatMetricValue(val: number | string | undefined): string {
    if (val === undefined || val === null) return "—";
    const n = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(n)) return String(val);
    return n.toLocaleString();
  }

  const totalRevenue = overview?.total_revenue?.amount;
  const totalRevenueGrowth = overview?.total_revenue?.growth_percentage ?? 0;
  const processedPayout = overview?.processed_payout?.amount;
  const processedPayoutGrowth = overview?.processed_payout?.growth_percentage ?? 0;
  const failedTransactions = overview?.failed_transactions;

  return (
    <InnerLayout sectionHeader="Payment" sectionSubheader="Manage and process payouts">
      <div>
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#22C55E" strokeWidth="1.5" />
                  <path d="M2 10h20" stroke="#22C55E" strokeWidth="1.5" />
                  <path d="M6 15h4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            }
            label="Total revenue"
            value={overview ? `₦${formatMetricValue(totalRevenue)}` : "—"}
            growth={totalRevenueGrowth}
            timeframeValue={timeframe}
            onTimeframeChange={setTimeframe}
          />
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#635bff" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5" stroke="#635bff" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" stroke="#635bff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            }
            label="Processed payouts"
            value={overview ? `₦${formatMetricValue(processedPayout)}` : "—"}
            growth={processedPayoutGrowth}
            timeframeValue={timeframe}
            onTimeframeChange={setTimeframe}
          />
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#EF4444" strokeWidth="1.5" />
                  <path d="M12 8v4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="0.75" fill="#EF4444" />
                </svg>
              </div>
            }
            label="Failed transactions"
            value={overview ? formatMetricValue(failedTransactions) : "—"}
            timeframeValue={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.role}
              onClick={() => setActiveTab(tab.role)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${
                  activeTab === tab.role
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <PaymentTable role={activeTab} />
      </div>
    </InnerLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  growth,
  timeframeValue,
  onTimeframeChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  growth?: number;
  timeframeValue: Timeframe;
  onTimeframeChange: (v: Timeframe) => void;
}) {
  const isPositive = growth === undefined || growth >= 0;
  const growthLabel =
    growth === undefined ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>{icon}</div>
        <TimeframeDropdown value={timeframeValue} onChange={onTimeframeChange} />
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <span
          className={`text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-full ${
            isPositive ? "text-green-700 bg-green-100" : "text-red-600 bg-red-100"
          }`}
        >
          <TrendingUp size={11} />
          {growthLabel}
        </span>
      </div>
    </div>
  );
}
