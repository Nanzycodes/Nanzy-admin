"use client";

import PerformanceCard from "@/components/dashboard/performance-card";
import OrdersCard from "@/components/dashboard/orders-card";
import InnerLayout from "@/components/inner-layout";
import { OverviewWithTime } from "@/components/misc";
import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiclient";

function Page() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [usersChange, setUsersChange] = useState<number | null>(null);
  const [topPerformers, setTopPerformers] = useState<any>(null);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [analyticsRes, metricsRes, ordersRes, performersRes] = await Promise.all([
          apiClient.get("/admin/dashboard/analytics/"),
          apiClient.get("/admin/customers/metrics/"),
          apiClient.get("/admin/orders/?page_size=1"),
          apiClient.get("/admin/dashboard/top-performers/"),
        ]);

        const analytics = analyticsRes.data?.data;
        const metrics = metricsRes.data?.data;
        const performers = performersRes.data?.data ?? performersRes.data;
        const ordersData = ordersRes.data?.data ?? ordersRes.data;

        setTotalUsers(Number(analytics?.user_distribution?.total_users || 0));
        setTotalSellers(Number(analytics?.user_distribution?.sellers?.count || 0));
        setTotalOrders(Number(ordersData?.count || 0));
        setUsersChange(metrics?.total_customers?.new_since_last_month ?? null);
        setTopPerformers(performers);

        // Robust extraction of the first Order ID
        const results = ordersData?.results || (Array.isArray(ordersData) ? ordersData : []);
        if (results.length > 0 && results[0]?.id) {
          setLatestOrderId(results[0].id);
        }

      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <>
      <p className="text-[#616161] mb-2.5">Good Morning, David!</p>
      <InnerLayout sectionHeader="Your Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
          <OverviewWithTime
            label="Total Users"
            value={totalUsers.toLocaleString()}
            trend={`${usersChange ?? 0} new this month`}
          />
          <OverviewWithTime
            label="Total Orders"
            value={totalOrders.toLocaleString()}
            trend="Updated recently"
          />
          <OverviewWithTime
            label="Total Sellers"
            value={totalSellers.toLocaleString()}
            trend="Updated recently"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <PerformanceCard className="h-full" topPerformers={topPerformers} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <OrdersCard className="h-full" orderId={latestOrderId} />
            </div>
          </div>
        </div>
      </InnerLayout>
    </>
  );
}

export default Page;