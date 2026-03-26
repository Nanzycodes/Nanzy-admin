"use client";

import { useState, useEffect } from "react";
import { fetchAnalytics, fetchCustomerMetrics, fetchTopContent, fetchTopSellers } from "@/lib/analytics";
import { TrendingUp, ChevronDown, ArrowUpRight, Calendar } from "lucide-react";

function UsersChart({ chartData }: { chartData: { count: number }[] }) {
  if (!chartData || chartData.length === 0) return null;
  const counts = chartData.map((d) => d.count);
  const max = Math.max(...counts, 1);
  const width = 208;
  const height = 120;
  const points = counts.map((count, i) => {
    const x = (i / (counts.length - 1)) * width;
    const y = height - (count / max) * (height - 10) - 5;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  return (
    <svg width="100%" height="120" viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={pathD} stroke="#B2ADFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmoothWaveChart({ chartData }: { chartData: { count: number }[] }) {
  if (!chartData || chartData.length === 0) return null;
  const counts = chartData.map((d) => d.count);
  const max = Math.max(...counts, 1);
  const width = 150;
  const height = 60;
  const points = counts.map((count, i) => {
    const x = (i / (counts.length - 1)) * width;
    const y = height - (count / max) * (height - 10) - 5;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  return (
    <svg width="100%" height="60" viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={pathD} stroke="#B2ADFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DonutChart({ customersPercent, sellersPercent }: { customersPercent: number; sellersPercent: number }) {
  const radius = 80;
  const cx = 110;
  const cy = 110;

  function getArc(startPercent: number, endPercent: number, color: string) {
    if (endPercent - startPercent <= 0) return null;
    
    const safeEnd = endPercent >= 100 ? 99.99 : endPercent;
    
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (safeEnd / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = safeEnd - startPercent > 50 ? 1 : 0;
    
    return (
      <path
        d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth="40"
        fill="none"
      />
    );
  }

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      <circle cx={cx} cy={cy} r={radius} stroke="#f3f4f6" strokeWidth="40" fill="none" />
      {getArc(0, customersPercent, "#635bff")}
      {getArc(customersPercent, customersPercent + sellersPercent, "#ec4899")}
    </svg>
  );
}

export default function AnalyticsDashboard() {
  const [topTab, setTopTab] = useState<"contents" | "sellers">("contents");
  const [analytics, setAnalytics] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [topContent, setTopContent] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAnalytics().catch(() => null),
      fetchCustomerMetrics().catch(() => null),
      fetchTopContent().catch(() => []),
      fetchTopSellers().catch(() => []),
    ]).then(([analyticsData, metricsData, contentData, sellersData]) => {
      setAnalytics(analyticsData);
      setMetrics(metricsData);
      setTopContent(contentData);
      setTopSellers(sellersData);
    }).finally(() => setLoading(false));
  }, []);

  const totalUsers = analytics?.users?.total ?? 0;
  const usersWeeklyChange = analytics?.users?.weekly_change ?? 0;
  const usersChart = analytics?.users?.chart ?? [];
  const totalUploads = analytics?.uploads?.total ?? 0;
  const uploadsWeeklyChange = analytics?.uploads?.weekly_change ?? 0;
  const uploadsChart = analytics?.uploads?.chart ?? [];
  
  const totalUsersCount = analytics?.user_distribution?.total_users ?? 0;
  const customersCount = analytics?.user_distribution?.customers?.count ?? 0;
  const sellersCount = analytics?.user_distribution?.sellers?.count ?? 0;

  // ── THE FIX: Force the chart total to be the exact sum of the two groups ──
  const chartTotal = customersCount + sellersCount > 0 ? customersCount + sellersCount : 1;
  const customersPercent = (customersCount / chartTotal) * 100;
  const sellersPercent = (sellersCount / chartTotal) * 100;

  const newUsers = metrics?.total_customers?.new_since_last_month ?? 0;
  const isUp = (val: number) => val >= 0;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Row 1: 3 metric cards ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Card 1 — Total Users */}
        <div className="bg-white rounded-xl border border-border p-3 col-span-1 flex flex-col justify-between" style={{ minHeight: 180 }}>
          <p className="text-sm font-medium text-foreground mb-0.5 mt-4">Total Users</p>
          <button className="flex items-center gap-1 text-xs text-muted-foreground mb-1 mt-2">
            This week <ChevronDown size={11} />
          </button>
          <div className="flex items-end gap-2 flex-1">
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2 mt-2">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : totalUsers.toLocaleString()}
                </p>
                <span className={isUp(usersWeeklyChange) ? "text-green-500 text-lg" : "text-red-500 text-lg"}>
                  {isUp(usersWeeklyChange) ? "▲" : "▼"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {usersWeeklyChange > 0 ? "+" : ""}{usersWeeklyChange} this week
              </p>
            </div>
            <div className="flex-1 flex items-end">
              <UsersChart chartData={usersChart} />
            </div>
          </div>
        </div>

        {/* Card 2 — New Users */}
        <div className="bg-white rounded-xl border border-border p-3 flex flex-col justify-between" style={{ minHeight: 180 }}>
          <p className="text-sm font-medium text-foreground mb-0.5 mt-4">New Users</p>
          <button className="flex items-center gap-1 text-xs text-muted-foreground mb-1 mt-2">
            This month <ChevronDown size={11} />
          </button>
          <div className="flex items-end gap-2 flex-1">
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : newUsers.toLocaleString()}
                </p>
                <span className="text-green-500 text-lg">▲</span>
              </div>
              <p className="text-xs text-muted-foreground">since last month</p>
            </div>
            <div className="flex-1 flex items-end">
              <SmoothWaveChart chartData={usersChart} />
            </div>
          </div>
        </div>

        {/* Card 3 — Uploads */}
        <div className="bg-white rounded-xl border border-border p-3 flex flex-col justify-between" style={{ minHeight: 180 }}>
          <p className="text-sm font-medium text-foreground mb-0.5 mt-4">Uploads</p>
          <button className="flex items-center gap-1 text-xs text-muted-foreground mb-1 mt-2">
            This week <ChevronDown size={11} />
          </button>
          <div className="flex items-end gap-2 flex-1">
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "..." : totalUploads.toLocaleString()}
                </p>
                <span className={isUp(uploadsWeeklyChange) ? "text-green-500 text-lg" : "text-red-500 text-lg"}>
                  {isUp(uploadsWeeklyChange) ? "▲" : "▼"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {uploadsWeeklyChange > 0 ? "+" : ""}{uploadsWeeklyChange} this week
              </p>
            </div>
            <div className="flex-1 flex items-end">
              <SmoothWaveChart chartData={uploadsChart} />
            </div>
          </div>
        </div>

      </div>

      {/* ── Row 2: Top Performing + Users donut ── */}
      <div className="grid grid-cols-[1fr_380px] gap-4">

        {/* Top Performing card */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Top Performing</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
                <Calendar size={11} />
                Today <ChevronDown size={11} />
              </button>
              <button className="p-1 rounded border border-border hover:bg-muted transition-colors">
                <ArrowUpRight size={13} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-border">
            <button
              onClick={() => setTopTab("contents")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${topTab === "contents" ? "border-primary text-primary bg-primary/5 rounded-t-md" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Contents
            </button>
            <button
              onClick={() => setTopTab("sellers")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                ${topTab === "sellers" ? "border-primary text-primary bg-primary/5 rounded-t-md" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Sellers
            </button>
          </div>

          {/* Contents Tab */}
          {topTab === "contents" && (
            <div className="flex flex-col divide-y divide-border">
              {topContent.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No content found</p>
              ) : (
                topContent.map((item: any, i: number) => {
                  const isVideo = item.content_type === "video";
                  const isArticle = item.content_type === "article";
                  const isLivestream = item.content_type === "livestream";

                  const title = isVideo
                    ? item.caption
                    : isArticle
                    ? item.title
                    : item.name;

                  const subtitle = isVideo
                    ? `${item.view_count ?? 0} views · ${item.like_count ?? 0} likes`
                    : isArticle
                    ? item.summary
                    : `${item.active_participants_count ?? 0} participants`;

                  const image = isVideo || isArticle
                    ? item.thumbnail
                    : item.creator_image;

                  const poster = isVideo
                    ? item.tags || "—"
                    : isArticle
                    ? item.author_name
                    : item.creator_name;

                  const typeLabel: Record<string, string> = {
                    video: "Video",
                    article: "Article",
                    livestream: "Live",
                    influencer_content: "Influencer",
                  };

                  return (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-muted flex items-center justify-center">
                        {image ? (
                          <img src={image} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">
                            {typeLabel[item.content_type] ?? "—"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {title || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground truncate max-w-[80px]">
                          {isVideo ? item.tags || "—" : `By ${poster}`}
                        </p>
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {typeLabel[item.content_type] ?? "—"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Sellers Tab */}
          {topTab === "sellers" && (
            <div className="flex flex-col divide-y divide-border">
              {topSellers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No sellers found</p>
              ) : (
                topSellers.map((seller: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 shrink-0 flex items-center justify-center text-xs font-medium text-primary">
                      {seller.first_name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {seller.business_name || `${seller.first_name} ${seller.last_name}`.trim() || seller.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {seller.product_count ?? 0} products · {seller.email}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      seller.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-500"
                    }`}>
                      {seller.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Users donut chart card */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">
              Users {!loading && `(${totalUsersCount.toLocaleString()})`}
            </p>
            <button className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1">
              This Month <ChevronDown size={11} />
            </button>
          </div>
          <div className="flex justify-center my-2">
            <DonutChart
              customersPercent={customersPercent}
              sellersPercent={sellersPercent}
            />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            
            {/* General Users Breakdown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-sm text-muted-foreground">General Users</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {loading ? "..." : customersCount.toLocaleString()} 
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  ({customersPercent.toFixed(1)}%)
                </span>
              </span>
            </div>

            {/* Sellers Breakdown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-pink-500" />
                <span className="text-sm text-muted-foreground">Sellers</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {loading ? "..." : sellersCount.toLocaleString()} 
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  ({sellersPercent.toFixed(1)}%)
                </span>
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}