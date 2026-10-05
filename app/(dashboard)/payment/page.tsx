"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import InnerLayout from "@/components/inner-layout";
import PaymentTable from "@/components/payment/payment-table";
import { TrendingUp, ChevronDown } from "lucide-react";
import apiClient from "@/lib/apiclient";
import { Transaction } from "@/types/payout";
import {
  DemoDataMode,
  getDemoDataMode,
  isDemoSession,
  subscribeToDemoSession,
} from "@/lib/demo-mode";
import { getDemoTransactions } from "@/lib/demo-payments";

type PayoutRole = "seller" | "influencer" | "delivery_partner";
type Timeframe = "weekly" | "monthly" | "yearly";

const TABS: { label: string; role: PayoutRole }[] = [
  { label: "Sellers", role: "seller" },
  { label: "Influencers", role: "influencer" },
  // { label: "Delivery partner", role: "delivery_partner" },
];

const TIMEFRAME_OPTIONS: { label: string; value: Timeframe }[] = [
  { label: "This Week", value: "weekly" },
  { label: "This Month", value: "monthly" },
  { label: "This Year", value: "yearly" },
];

function formatMetricValue(val: number | string | undefined): string {
  if (val === undefined || val === null) return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  return n.toLocaleString();
}

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
  const demoSession = useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSession,
    () => false,
  );
  const demoDataMode = useSyncExternalStore<DemoDataMode>(
    subscribeToDemoSession,
    getDemoDataMode,
    () => "sample",
  );
  const [demoTransactions, setDemoTransactions] = useState<Transaction[]>([]);
  const [demoTransactionsError, setDemoTransactionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!demoSession) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        setDemoTransactions(getDemoTransactions(demoDataMode));
        setDemoTransactionsError(null);
      } catch (error) {
        setDemoTransactionsError(
          error instanceof Error
            ? error.message
            : "Could not load saved demo transactions.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [demoSession, demoDataMode]);

  return (
    <InnerLayout sectionHeader="Payment" sectionSubheader="Manage and process payouts">
      <div>
        {/* Stat cards — each manages its own timeframe independently */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Image src="/images/totalpaymenticon.svg" alt="Total payment" width={20} height={20} />
              </div>
            }
            label="Total revenue"
            metricKey="total_revenue"
            valuePrefix="₦"
            demoTransactions={demoSession ? demoTransactions : undefined}
          />
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Image src="/images/processedpayoutIcon.svg" alt="Processed payout" width={20} height={20} />
              </div>
            }
            label="Processed payouts"
            metricKey="processed_payout"
            valuePrefix="₦"
            demoTransactions={demoSession ? demoTransactions : undefined}
          />
          <StatCard
            icon={
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Image src="/images/failedPaymenticon.svg" alt="Failed payment" width={20} height={20} />
              </div>
            }
            label="Failed transactions"
            metricKey="failed_transactions"
            demoTransactions={demoSession ? demoTransactions : undefined}
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

        {demoSession && (
          <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            These are read-only sample transactions. No payout or payment is being initiated.
          </p>
        )}
        {demoTransactionsError && (
          <p role="alert" className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {demoTransactionsError}
          </p>
        )}
        <PaymentTable
          role={activeTab}
          demoTransactions={demoSession ? demoTransactions : undefined}
        />
      </div>
    </InnerLayout>
  );
}

function StatCard({
  icon,
  label,
  metricKey,
  valuePrefix = "",
  demoTransactions,
}: {
  icon: React.ReactNode;
  label: string;
  metricKey: "total_revenue" | "processed_payout" | "failed_transactions";
  valuePrefix?: string;
  demoTransactions?: Transaction[];
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [value, setValue] = useState("—");
  const [growth, setGrowth] = useState<number | undefined>();

  useEffect(() => {
    if (demoTransactions !== undefined) return;
    async function fetchOverview() {
      try {
        const response = await apiClient.get(
          `/admin/transactions/overview/?timeframe=${timeframe}`
        );
        const data = response.data?.data ?? response.data;
        if (!data) return;

        if (metricKey === "failed_transactions") {
          setValue(formatMetricValue(data.failed_transactions));
          setGrowth(undefined);
        } else {
          const metric = data[metricKey];
          setValue(`${valuePrefix}${formatMetricValue(metric?.amount)}`);
          setGrowth(metric?.growth_percentage ?? 0);
        }
      } catch {
        // best-effort
      }
    }
    fetchOverview();
  }, [timeframe, metricKey, valuePrefix, demoTransactions]);

  const threshold = new Date();
  threshold.setDate(
    threshold.getDate() -
      (timeframe === "weekly" ? 7 : timeframe === "monthly" ? 30 : 365),
  );
  const periodTransactions = demoTransactions?.filter(
    (transaction) => new Date(transaction.created_at) >= threshold,
  );
  const demoTotal = periodTransactions?.reduce((sum, transaction) => {
    const amount = Number(transaction.amount);
    if (!Number.isFinite(amount)) return sum;
    if (
      transaction.status === "COMPLETED" &&
      transaction.transaction_type === "PAYMENT"
    ) {
      return metricKey === "total_revenue" ? sum + amount : sum;
    }
    if (
      metricKey === "total_revenue" &&
      transaction.status === "COMPLETED" &&
      transaction.transaction_type === "DEPOSIT"
    ) {
      return sum + amount;
    }
    if (
      metricKey === "processed_payout" &&
      transaction.status === "COMPLETED" &&
      transaction.transaction_type === "WITHDRAWAL"
    ) {
      return sum + amount;
    }
    if (
      metricKey === "failed_transactions" &&
      (transaction.status === "FAILED" || transaction.status === "CANCELLED")
    ) {
      return sum + 1;
    }
    return sum;
  }, 0);
  const displayedValue =
    demoTotal === undefined
      ? value
      : metricKey === "failed_transactions"
        ? demoTotal.toLocaleString()
        : `${valuePrefix}${demoTotal.toLocaleString("en-NG")}`;

  const isPositive = growth === undefined || growth >= 0;
  const growthLabel =
    growth === undefined ? "—" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>{icon}</div>
        <TimeframeDropdown value={timeframe} onChange={setTimeframe} />
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-foreground">{displayedValue}</p>
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
