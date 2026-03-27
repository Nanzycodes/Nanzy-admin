"use client";

import PerformanceCard from "@/components/dashboard/performance-card";
import OrdersCard from "@/components/dashboard/orders-card";
import InnerLayout from "@/components/inner-layout";
import { OverviewWithTime } from "@/components/misc";
import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiclient";
import adminAuthApi from "@/lib/auth";

function Page() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalInfluencers, setTotalInfluencers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [usersNewThisMonth, setUsersNewThisMonth] = useState(0);
  const [usersWeeklyChange, setUsersWeeklyChange] = useState(0);
  const [sellersPercentage, setSellersPercentage] = useState(0);
  const [topPerformers, setTopPerformers] = useState<any>(null);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("User");

  useEffect(() => {
    adminAuthApi.getProfile().then((profile) => {
      if (profile?.first_name) setFirstName(profile.first_name);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [analyticsRes, metricsRes, ordersRes, performersRes] =
          await Promise.all([
            apiClient.get("/admin/dashboard/analytics/"),
            apiClient.get("/admin/customers/metrics/"),
            apiClient.get("/admin/orders/?page_size=1"),
            apiClient.get("/admin/dashboard/top-performers/"),
          ]);

        const analytics = analyticsRes.data?.data;
        const metrics = metricsRes.data?.data;
        const performers = performersRes.data?.data ?? performersRes.data;
        const ordersData = ordersRes.data?.data ?? ordersRes.data;

        // analytics.user_distribution
        setTotalUsers(Number(analytics?.user_distribution?.total_users || 0));
        setTotalSellers(Number(analytics?.user_distribution?.sellers?.count || 0));
        setSellersPercentage(Number(analytics?.user_distribution?.sellers?.percentage || 0));
        setTotalInfluencers(Number(analytics?.user_distribution?.influencers?.count || 0));

        // analytics.users — weekly new signups
        setUsersWeeklyChange(Number(analytics?.users?.weekly_change || 0));

        // customers/metrics — monthly new users
        setUsersNewThisMonth(Number(metrics?.total_customers?.new_since_last_month || 0));

        // orders
        setTotalOrders(Number(ordersData?.count || 0));

        // top performers
        setTopPerformers(performers);

        // latest order ID
        const results =
          ordersData?.results || (Array.isArray(ordersData) ? ordersData : []);
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
      <p className="text-[#616161] mb-2.5">Good Day, {firstName}!</p>
      <InnerLayout sectionHeader="Your Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
          <OverviewWithTime
            label="Total Users"
            value={totalUsers.toLocaleString()}
            trend={`${usersNewThisMonth} new this month`}
          />
          <OverviewWithTime
            label="Total Orders"
            value={totalOrders.toLocaleString()}
            trend="Updated recently"
          />
          <OverviewWithTime
            label="Total Sellers"
            value={totalSellers.toLocaleString()}
            trend={`${sellersPercentage.toFixed(1)}% of total users`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <PerformanceCard className="h-full" topPerformers={topPerformers} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <OrdersCard className="h-fit" orderId={latestOrderId} />
            </div>
          </div>
        </div>
      </InnerLayout>
    </>
  );
}

export default Page;
