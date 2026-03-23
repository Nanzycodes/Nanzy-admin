"use client";

// app/(dashboard)/analytics/page.tsx

import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track growth of users and platform</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
