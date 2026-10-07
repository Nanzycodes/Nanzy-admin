"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { fetchAnalytics, fetchTopContent, fetchTopSellers } from "@/lib/analytics";
import { TrendingUp, ChevronDown, ArrowUpRight, Calendar } from "lucide-react";
import DemoAnalyticsDashboard from "@/components/analytics/demo-analytics-dashboard";
import {
  DemoDataMode,
  getDemoDataMode,
  isDemoSession,
  subscribeToDemoSession,
} from "@/lib/demo-mode";

type Timeframe = "weekly" | "monthly" | "yearly";

type MetricData = {
  total?: number;
  weekly_change?: number;
  chart?: Array<{ count: number }>;
};

type AnalyticsSnapshot = {
  user_distribution?: {
    total_users?: number;
    customers?: { count?: number };
    sellers?: { count?: number };
  };
};

type TopContentItem = {
  content_type?: string;
  caption?: string;
  title?: string;
  name?: string;
  view_count?: number;
  like_count?: number;
  summary?: string;
  active_participants_count?: number;
  thumbnail?: string;
  tags?: string;
  author_name?: string;
  creator_name?: string;
  creator_image?: string;
};

type TopSellerItem = {
  first_name?: string;
  last_name?: string;
  business_name?: string;
  email?: string;
  product_count?: number;
  status?: string;
};

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  weekly: "This week",
  monthly: "This month",
  yearly: "This year",
};

function buildSmoothPath(
  pts: [number, number][],
  w: number,
  h: number,
): { line: string; area: string } {
  if (pts.length < 2) return { line: "", area: "" };
  let line = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = i > 0 ? pts[i - 1] : pts[0];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const [x3, y3] = i < pts.length - 2 ? pts[i + 2] : pts[pts.length - 1];
    const cp1x = x1 + (x2 - x0) / 6;
    const cp1y = y1 + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - x1) / 6;
    const cp2y = y2 - (y3 - y1) / 6;
    line += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
  }
  const area = `${line} L ${pts[pts.length - 1][0]},${h} L ${pts[0][0]},${h} Z`;
  return { line, area };
}

function LineChart({
  chartData,
  width,
  height,
  svgHeight,
}: {
  chartData: { count: number }[];
  width: number;
  height: number;
  svgHeight: number;
}) {
  if (!chartData || chartData.length === 0) return null;
  const counts = chartData.map((d) => d.count);
  const max = Math.max(...counts);
  const TOP = height * 0.08;
  const BOTTOM = height * 0.88;
  const pts: [number, number][] = counts.map((count, i) => [
    counts.length === 1 ? width / 2 : (i / (counts.length - 1)) * width,
    max === 0 ? height * 0.55 : BOTTOM - (count / max) * (BOTTOM - TOP),
  ]);
  const { line, area } = buildSmoothPath(pts, width, height);
  const gradId = `grad-${width}-${svgHeight}`;
  return (
    <svg width="100%" height={svgHeight} viewBox={`0 0 ${width} ${height}`} fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#635BFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#635BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} stroke="#635BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricCard({
  label,
  metricKey,
  renderValue,
  renderTrend,
}: {
  label: string;
  metricKey: "users" | "uploads";
  renderValue: (data: MetricData | null | undefined) => string;
  renderTrend: (data: MetricData | null | undefined) => string;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [tfOpen, setTfOpen] = useState(false);
  const [data, setData] = useState<MetricData | null | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setTfOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetchAnalytics(timeframe);
        if (!active) return;
        setData(res?.[metricKey] ?? null);
      } catch {
        if (active) setData(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [timeframe, metricKey]);

  const chart = data?.chart ?? [];
  const loading = data === undefined;
  const isUp = (val: number) => val >= 0;
  const change = data?.weekly_change ?? 0;

  return (
    <div ref={ref} className="bg-white rounded-xl border border-border px-4 py-3 flex flex-row items-center justify-between" style={{ minHeight: 120 }}>
      <div className="flex flex-col justify-center shrink-0">
        <p className="text-sm font-medium text-foreground mb-0.5">{label}</p>
        <div className="relative mb-2">
          <button
            onClick={() => setTfOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {TIMEFRAME_LABELS[timeframe]} <ChevronDown size={11} />
          </button>
          {tfOpen && (
            <div className="absolute top-6 left-0 z-50 bg-white border border-border rounded-md shadow-md w-36 py-1">
              {(Object.keys(TIMEFRAME_LABELS) as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => { setTimeframe(tf); setTfOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${timeframe === tf ? "text-primary font-medium" : "text-foreground"}`}
                >
                  {TIMEFRAME_LABELS[tf]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-foreground">{loading ? "..." : renderValue(data)}</p>
          <span className={isUp(change) ? "text-green-500 text-lg" : "text-red-500 text-lg"}>
            {isUp(change) ? "▲" : "▼"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{loading ? "" : renderTrend(data)}</p>
      </div>
      <div className="flex-1 min-w-0 h-22.5 ml-4 overflow-hidden">
        <LineChart chartData={chart} width={220} height={90} svgHeight={90} />
      </div>
    </div>
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

function LiveAnalyticsDashboard() {
  const [topTab, setTopTab] = useState<"contents" | "sellers">("contents");
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [topContent, setTopContent] = useState<TopContentItem[]>([]);
  const [topSellers, setTopSellers] = useState<TopSellerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetchAnalytics().catch(() => null),
      fetchTopContent().catch(() => []),
      fetchTopSellers().catch(() => []),
    ]).then(([analyticsData, contentData, sellersData]) => {
      if (!active) return;
      setAnalytics(analyticsData);
      setTopContent(contentData);
      setTopSellers(sellersData);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);
  
  const totalUsersCount = analytics?.user_distribution?.total_users ?? 0;
  const customersCount = analytics?.user_distribution?.customers?.count ?? 0;
  const sellersCount = analytics?.user_distribution?.sellers?.count ?? 0;

  // ── THE FIX: Force the chart total to be the exact sum of the two groups ──
  const chartTotal = customersCount + sellersCount > 0 ? customersCount + sellersCount : 1;
  const customersPercent = (customersCount / chartTotal) * 100;
  const sellersPercent = (sellersCount / chartTotal) * 100;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Row 1: 3 metric cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Total Users"
          metricKey="users"
          renderValue={(d) => (d?.total ?? 0).toLocaleString()}
          renderTrend={(d) => {
            const c = d?.weekly_change ?? 0;
            return `${c > 0 ? "+" : ""}${c} this period`;
          }}
        />
        <MetricCard
          label="New Users"
          metricKey="users"
          renderValue={(d) => (d?.weekly_change ?? 0).toLocaleString()}
          renderTrend={() => "new this period"}
        />
        <MetricCard
          label="Uploads"
          metricKey="uploads"
          renderValue={(d) => (d?.total ?? 0).toLocaleString()}
          renderTrend={(d) => {
            const c = d?.weekly_change ?? 0;
            return `${c > 0 ? "+" : ""}${c} this period`;
          }}
        />
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
                topContent.map((item: TopContentItem, i: number) => {
                  const contentType = item.content_type ?? "video";
                  const isVideo = contentType === "video";
                  const isArticle = contentType === "article";

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
                          <Image
                            src={image}
                            alt={title || "Content cover"}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">
                            {typeLabel[contentType] ?? "—"}
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
                          {typeLabel[contentType] ?? "—"}
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
                topSellers.map((seller: TopSellerItem, i: number) => (
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

export default function AnalyticsDashboard() {
  const demoSession = useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSession,
    () => false,
  );
  const dataMode = useSyncExternalStore<DemoDataMode>(
    subscribeToDemoSession,
    getDemoDataMode,
    () => "sample",
  );

  return demoSession ? (
    <DemoAnalyticsDashboard dataMode={dataMode} />
  ) : (
    <LiveAnalyticsDashboard />
  );
}