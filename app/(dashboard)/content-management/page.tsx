"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import InnerLayout from "@/components/inner-layout";
import ContentTable from "@/components/collections/content-table";
import apiClient from "@/lib/apiclient";

type TabFilter = "all" | "approved" | "flagged";

const TABS: { label: string; value: TabFilter }[] = [
  { label: "All", value: "all" },
  // { label: "Approved", value: "approved" },
  // { label: "Flagged", value: "flagged" },
];

interface ContentStats {
  total_submissions: number;
  flagged_count: number;
  approved_count: number;
  total_growth?: number;
  flagged_growth?: number;
  approved_growth?: number;
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [stats, setStats] = useState<ContentStats | null>(null);

  useEffect(() => {
    apiClient
      .get("/admin/content/stats/")
      .then((res) => {
        const d = res.data?.data ?? res.data;
        setStats(d);
      })
      .catch(() => {
        // Stats endpoint may not exist — silently skip
      });
  }, []);

  const total = stats?.total_submissions ?? 0;
  const flagged = stats?.flagged_count ?? 0;
  const approved = stats?.approved_count ?? 0;

  return (
    <InnerLayout sectionHeader="Content" sectionSubheader="Review and flag posts">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Submissions"
          value={total}
          growth={stats?.total_growth}
          growthLabel="since last month"
        />
        {/* <StatCard
          label="Flagged Contents"
          value={flagged}
          growth={stats?.flagged_growth}
          growthLabel="since last week"
        />
        <StatCard
          label="Approved Contents"
          value={approved}
          growth={stats?.approved_growth}
          growthLabel="since last week"
        /> */}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.value
                ? "border-primary text-primary bg-[#F5F4FF] rounded-t-md"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ContentTable tab={activeTab} />
    </InnerLayout>
  );
}

function StatCard({
  label,
  value,
  growth,
  growthLabel,
}: {
  label: string;
  value: number;
  growth?: number;
  growthLabel?: string;
}) {
  const isPositive = growth === undefined || growth >= 0;
  const growthStr =
    growth === undefined
      ? null
      : `${growth >= 0 ? "+" : ""}${growth.toLocaleString()} ${growthLabel ?? ""}`;

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      {growthStr && (
        <p className="text-xs flex items-center gap-1 text-green-600 mb-1">
          <TrendingUp size={11} />
          {growthStr}
        </p>
      )}
      <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}
