"use client";

import React, { useState } from "react";
import DashboardCardContainer from "./card-container";
import { BoxTrendUp, contentMiniImg } from "@/lib/utils";
import Contents from "./contents";
import Sellers from "./sellers";

const PerformanceCard = () => {
  return (
    <DashboardCardContainer cardTitle="Top Performing" titleIcon={BoxTrendUp}>
      <PerformanceTabs />
    </DashboardCardContainer>
  );
};

export default PerformanceCard;

export const PerformanceTabs = () => {
  const [activeTab, setActiveTab] = useState<"contents" | "sellers">(
    "contents",
  );

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4 border-b border-[#E6E6E6]">
        {["contents", "sellers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "contents" | "sellers")}
            className={`py-[10px] px-[25px] rounded-[5px] text-center font-medium capitalize transition-colors
              ${
                activeTab === tab
                  ? "bg-[#ECEBFF]"
                  : "bg-transparent text-[#9E9E9E]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="">
        {activeTab === "contents" && <Contents />}

        {activeTab === "sellers" && <Sellers />}
      </div>
    </div>
  );
};
