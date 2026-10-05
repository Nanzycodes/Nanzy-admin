"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { DemoDataMode } from "@/lib/demo-mode";
import { getDemoOrders } from "@/lib/demo-orders";
import { getDemoTransactions } from "@/lib/demo-payments";
import { getDemoProducts } from "@/lib/demo-products";
import { getDemoUsers } from "@/lib/demo-users";
import { OrderDetail } from "@/types/order";
import { Transaction } from "@/types/payout";
import { ProductDetail } from "@/types/product";
import { User } from "@/types/user";

type Range = "week" | "month" | "year";
type LeaderTab = "products" | "sellers";

interface AnalyticsRecords {
  users: User[];
  orders: OrderDetail[];
  transactions: Transaction[];
  products: ProductDetail[];
  capturedAt: number;
}

interface ActivityBucket {
  label: string;
  orders: number;
  users: number;
  sales: number;
}

const RANGE_LABELS: Record<Range, string> = {
  week: "Last 7 days",
  month: "Last 30 days",
  year: "This year",
};

const SETTLED_ORDER_STATUSES = new Set([
  "PAID",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
]);

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function relativeCutoff(range: Range, capturedAt: number): number {
  if (range === "year") {
    const yearStart = new Date(capturedAt);
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);
    return yearStart.getTime();
  }
  const days = range === "week" ? 7 : 30;
  return capturedAt - days * 24 * 60 * 60 * 1000;
}

function getBuckets(range: Range, capturedAt: number): ActivityBucket[] {
  const now = new Date(capturedAt);
  const bucketCount = range === "week" ? 7 : range === "month" ? 5 : 12;

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketDate = new Date(capturedAt);
    if (range === "week") {
      bucketDate.setDate(now.getDate() - (bucketCount - index - 1));
      return {
        label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(bucketDate),
        orders: 0,
        users: 0,
        sales: 0,
      };
    }
    if (range === "month") {
      bucketDate.setDate(now.getDate() - bucketCount * 6 + index * 6);
      return {
        label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(bucketDate),
        orders: 0,
        users: 0,
        sales: 0,
      };
    }
    bucketDate.setMonth(index, 1);
    return {
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(bucketDate),
      orders: 0,
      users: 0,
      sales: 0,
    };
  });
}

function bucketIndex(value: string, range: Range, capturedAt: number): number {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return -1;
  const now = new Date(capturedAt);
  if (range === "week") {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const firstDay = new Date(dayStart);
    firstDay.setDate(firstDay.getDate() - 6);
    const index = Math.floor((date.getTime() - firstDay.getTime()) / 86_400_000);
    return index >= 0 && index < 7 ? index : -1;
  }
  if (range === "month") {
    const firstWeek = new Date(now);
    firstWeek.setHours(0, 0, 0, 0);
    firstWeek.setDate(firstWeek.getDate() - 30);
    const index = Math.floor((date.getTime() - firstWeek.getTime()) / (6 * 86_400_000));
    return index >= 0 && index < 5 ? index : -1;
  }
  if (date.getFullYear() !== now.getFullYear() || date.getTime() > capturedAt) {
    return -1;
  }
  return date.getMonth();
}

function ProgressBars({ buckets }: { buckets: ActivityBucket[] }) {
  const maxOrders = Math.max(1, ...buckets.map((bucket) => bucket.orders));
  const maxSales = Math.max(1, ...buckets.map((bucket) => bucket.sales));

  return (
    <div className="mt-5 space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">Orders placed</span>
          <span className="text-muted-foreground">
            {buckets.reduce((total, bucket) => total + bucket.orders, 0).toLocaleString()}
          </span>
        </div>
        <div className="flex h-28 items-end gap-2">
          {buckets.map((bucket, index) => (
            <div key={`${bucket.label}-${index}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t bg-[#635BFF] transition-all"
                style={{ height: `${bucket.orders === 0 ? 3 : Math.max(10, (bucket.orders / maxOrders) * 100)}%` }}
                title={`${bucket.orders} orders`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between gap-1 text-[10px] text-muted-foreground">
          {buckets.map((bucket, index) => (
            <span key={`${bucket.label}-label-${index}`} className="min-w-0 flex-1 truncate text-center">
              {bucket.label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">Processed payment volume</span>
          <span className="text-muted-foreground">
            {formatMoney(buckets.reduce((total, bucket) => total + bucket.sales, 0))}
          </span>
        </div>
        <div className="flex h-20 items-end gap-2">
          {buckets.map((bucket, index) => (
            <div key={`${bucket.label}-sales-${index}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t bg-emerald-500 transition-all"
                style={{ height: `${bucket.sales === 0 ? 3 : Math.max(10, (bucket.sales / maxSales) * 100)}%` }}
                title={formatMoney(bucket.sales)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoMetricCard({
  label,
  value,
  detail,
  icon,
  change,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  change: number;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F0FF] text-[#635BFF]">
          {icon}
        </span>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        {change > 0 ? (
          <ArrowUpRight size={13} className="text-emerald-600" />
        ) : change < 0 ? (
          <ArrowDownRight size={13} className="text-rose-600" />
        ) : null}
        {detail}
      </p>
    </section>
  );
}

export default function DemoAnalyticsDashboard({ dataMode }: { dataMode: DemoDataMode }) {
  const [records, setRecords] = useState<AnalyticsRecords | null>(null);
  const [range, setRange] = useState<Range>("month");
  const [leaderTab, setLeaderTab] = useState<LeaderTab>("products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        setRecords({
          users: getDemoUsers(dataMode),
          orders: getDemoOrders(dataMode),
          transactions: getDemoTransactions(dataMode),
          products: getDemoProducts(dataMode),
          capturedAt: Date.now(),
        });
        setError(null);
      } catch (loadError) {
        setRecords(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load analytics from saved demo records.",
        );
      } finally {
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [dataMode]);

  const analysis = useMemo(() => {
    if (!records) return null;
    const { users, orders, transactions, products, capturedAt } = records;
    const cutoff = relativeCutoff(range, capturedAt);
    const periodOrders = orders.filter(
      (order) => new Date(order.created_at).getTime() >= cutoff,
    );
    const settledOrders = orders.filter((order) =>
      SETTLED_ORDER_STATUSES.has(order.status),
    );
    const periodSettledOrders = periodOrders.filter((order) =>
      SETTLED_ORDER_STATUSES.has(order.status),
    );
    const completedPayments = transactions.filter(
      (transaction) =>
        transaction.status === "COMPLETED" &&
        (transaction.transaction_type === "PAYMENT" ||
          transaction.transaction_type === "DEPOSIT"),
    );
    const periodPayments = completedPayments.filter(
      (transaction) => new Date(transaction.created_at).getTime() >= cutoff,
    );
    const grossSales = completedPayments.reduce(
      (total, transaction) => total + (Number(transaction.amount) || 0),
      0,
    );
    const periodGrossSales = periodPayments.reduce(
      (total, transaction) => total + (Number(transaction.amount) || 0),
      0,
    );
    const periodUsers = users.filter(
      (user) => new Date(user.date_joined).getTime() >= cutoff,
    );
    const activeUsers = users.filter((user) => user.status === "active").length;
    const sellers = users.filter((user) => user.role === "seller").length;
    const influencers = users.filter((user) => user.role === "influencer").length;
    const customers = users.filter((user) => user.role === "user").length;
    const buckets = getBuckets(range, capturedAt);

    for (const order of orders) {
      const index = bucketIndex(order.created_at, range, capturedAt);
      if (index < 0 || !buckets[index]) continue;
      buckets[index].orders += 1;
    }
    for (const transaction of completedPayments) {
      const index = bucketIndex(transaction.created_at, range, capturedAt);
      if (index >= 0 && buckets[index]) {
        buckets[index].sales += Number(transaction.amount) || 0;
      }
    }
    for (const user of users) {
      const index = bucketIndex(user.date_joined, range, capturedAt);
      if (index >= 0 && buckets[index]) buckets[index].users += 1;
    }

    const productSales = new Map<string, number>();
    const sellerSales = new Map<string, number>();
    for (const order of periodSettledOrders) {
      sellerSales.set(order.creator, (sellerSales.get(order.creator) ?? 0) + 1);
      for (const item of order.items) {
        productSales.set(item.name, (productSales.get(item.name) ?? 0) + 1);
      }
    }
    const leaders = leaderTab === "products"
      ? Array.from(productSales, ([name, count]) => ({ name, count, type: "product" as const }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      : Array.from(sellerSales, ([name, count]) => ({ name, count, type: "seller" as const }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

    return {
      users,
      orders,
      products,
      periodOrders,
      settledOrders,
      periodUsers,
      grossSales,
      periodGrossSales,
      activeUsers,
      sellers,
      influencers,
      customers,
      buckets,
      leaders,
      pendingOrders: orders.filter((order) => order.status === "PENDING").length,
      fulfilledOrders: orders.filter((order) => order.status === "DELIVERED").length,
      lowStockProducts: products.filter((product) => product.inventory <= 3),
    };
  }, [leaderTab, range, records]);

  if (loading) {
    return <div className="rounded-xl border border-border bg-white p-8 text-sm text-muted-foreground">Loading demo analytics…</div>;
  }
  if (error && !records) {
    return (
      <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        {error}
      </p>
    );
  }

  const customerShare =
    analysis && analysis.users.length > 0
      ? (analysis.customers / analysis.users.length) * 100
      : 0;
  const partnerShare =
    analysis && analysis.users.length > 0
      ? ((analysis.sellers + analysis.influencers) / analysis.users.length) * 100
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>Demo analytics are calculated from this browser&apos;s sample/empty users, products, orders, and payment records.</p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs font-medium">
          Period
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
            className="h-8 rounded-md border border-amber-300 bg-white px-2 text-foreground"
          >
            {Object.entries(RANGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DemoMetricCard
          label="Total users"
          value={(analysis?.users.length ?? 0).toLocaleString()}
          detail={`${analysis?.periodUsers.length ?? 0} joined in ${RANGE_LABELS[range].toLowerCase()}`}
          icon={<Users size={19} />}
          change={analysis?.periodUsers.length ?? 0}
        />
        <DemoMetricCard
          label="Total orders"
          value={(analysis?.orders.length ?? 0).toLocaleString()}
          detail={`${analysis?.periodOrders.length ?? 0} placed in ${RANGE_LABELS[range].toLowerCase()}`}
          icon={<ShoppingBag size={19} />}
          change={analysis?.periodOrders.length ?? 0}
        />
        <DemoMetricCard
          label="Processed payment volume"
          value={formatMoney(analysis?.grossSales ?? 0)}
          detail={`${formatMoney(analysis?.periodGrossSales ?? 0)} in ${RANGE_LABELS[range].toLowerCase()}`}
          icon={<Banknote size={19} />}
          change={analysis?.periodGrossSales ?? 0}
        />
        <DemoMetricCard
          label="Product listings"
          value={(analysis?.products.length ?? 0).toLocaleString()}
          detail={`${analysis?.lowStockProducts.length ?? 0} low-stock listings`}
          icon={<Package size={19} />}
          change={analysis?.products.length ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={17} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Marketplace activity</h2>
          </div>
          {analysis && analysis.orders.length > 0 ? (
            <ProgressBars buckets={analysis.buckets} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No order activity in this data mode yet.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Customer mix</h2>
            <span className="text-xs text-muted-foreground">{analysis?.users.length ?? 0} users</span>
          </div>
          <div className="my-3 flex justify-center">
            <svg
              viewBox="0 0 220 220"
              className="h-48 w-48"
              role="img"
              aria-label={`${analysis?.customers ?? 0} customers and ${(analysis?.sellers ?? 0) + (analysis?.influencers ?? 0)} sellers and creators`}
            >
              <circle cx="110" cy="110" r="80" fill="none" stroke="#f3f4f6" strokeWidth="40" />
              <circle
                cx="110"
                cy="110"
                r="80"
                fill="none"
                stroke="#635bff"
                strokeWidth="40"
                strokeDasharray={`${customerShare * 5.0265} 502.65`}
                transform="rotate(-90 110 110)"
              />
              <circle
                cx="110"
                cy="110"
                r="80"
                fill="none"
                stroke="#ec4899"
                strokeWidth="40"
                strokeDasharray={`${partnerShare * 5.0265} 502.65`}
                strokeDashoffset={`${-customerShare * 5.0265}`}
                transform="rotate(-90 110 110)"
              />
              <text x="110" y="106" textAnchor="middle" className="fill-foreground text-2xl font-bold">
                {analysis?.users.length ?? 0}
              </text>
              <text x="110" y="128" textAnchor="middle" className="fill-muted-foreground text-xs">
                users
              </text>
            </svg>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-3 w-3 rounded-sm bg-[#635bff]" /> Customers
              </span>
              <span className="font-medium">{analysis?.customers ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-3 w-3 rounded-sm bg-pink-500" /> Sellers &amp; creators
              </span>
              <span className="font-medium">{(analysis?.sellers ?? 0) + (analysis?.influencers ?? 0)}</span>
            </div>
            <div className="border-t border-border pt-2 text-xs text-muted-foreground">
              {analysis?.activeUsers ?? 0} active · {analysis?.pendingOrders ?? 0} pending orders · {analysis?.fulfilledOrders ?? 0} delivered
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-border bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Top performing</h2>
            <div className="flex gap-1 border-b border-border">
              {(["products", "sellers"] as LeaderTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeaderTab(tab)}
                  className={`border-b-2 px-3 py-2 text-sm capitalize ${
                    leaderTab === tab
                      ? "border-primary font-medium text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {analysis?.leaders.length ? (
            <div className="divide-y divide-border">
              {analysis.leaders.map((leader) => (
                <div key={leader.name} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{leader.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {leader.count}{" "}
                      {leader.type === "product"
                        ? leader.count === 1
                          ? "item sold"
                          : "items sold"
                        : leader.count === 1
                          ? "order"
                          : "orders"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {leader.count.toLocaleString()} {leader.type === "product" ? "sold" : "orders"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No settled {leaderTab} activity in this data mode.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Package size={17} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Inventory watchlist</h2>
          </div>
          {analysis?.lowStockProducts.length ? (
            <div className="divide-y divide-border">
              {analysis.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 py-3">
                  <p className="truncate text-sm font-medium">{product.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${
                    product.inventory === 0
                      ? "bg-rose-50 text-rose-700"
                      : "bg-amber-50 text-amber-800"
                  }`}>
                    {product.inventory === 0 ? "Out of stock" : `${product.inventory} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products need a low-stock review.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
