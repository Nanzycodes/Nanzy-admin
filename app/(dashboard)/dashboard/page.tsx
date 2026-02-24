import { InnerContainer } from "@/components/auth-layout";
import PerformanceCard from "@/components/dashboard/performance-card";
import InnerLayout from "@/components/inner-layout";
import { OverviewWithTime } from "@/components/misc";
import React from "react";

function Page() {
  return (
    <>
      <p className="text-[#616161] mb-2.5">Good Morning, David!</p>
      <InnerLayout sectionHeader="Your Dashboard">
        <div className="flex gap-x-3.5 mb-7">
          <OverviewWithTime />
          <OverviewWithTime />
          <OverviewWithTime />
          <OverviewWithTime />
        </div>

        <div>
          <PerformanceCard />
        </div>
      </InnerLayout>
    </>
  );
}

export default Page;
