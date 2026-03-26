import PerformanceCard from "@/components/dashboard/performance-card";
import RecentActivities from "@/components/dashboard/recent-activities";
import OrdersCard from "@/components/dashboard/orders-card";
import InnerLayout from "@/components/inner-layout";
import { OverviewWithTime } from "@/components/misc";
import React from "react";

function Page() {
  return (
    <>
      <p className="text-[#616161] mb-2.5">Good Morning, David!</p>
      <InnerLayout sectionHeader="Your Dashboard">
        {/* Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
          <OverviewWithTime />
          <OverviewWithTime />
          <OverviewWithTime />
          <OverviewWithTime />
        </div>

        {/* Main Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2">
            <PerformanceCard className="h-full" />
          </div>

          {/* Right Column (1/3 width stack) */}
          <div className="flex flex-col gap-6">
            <RecentActivities />
            {/* flex-1 pushes the OrdersCard to the bottom, aligning with the left card */}
            <div className="flex-1">
              <OrdersCard className="h-full" />
            </div>
          </div>

        </div>
      </InnerLayout>
    </>
  );
}

export default Page;