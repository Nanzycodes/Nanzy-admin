"use client";

import React, { useState } from "react";
import DashboardCardContainer from "./card-container";
import { BoxTrendUp } from "@/lib/utils";
import Contents from "./contents";
import Sellers from "./sellers";

const PerformanceCard = ({ className = "", topPerformers }: { 
  className?: string;
  topPerformers?: any;
}) => {
  return (
    <DashboardCardContainer cardTitle="Top Performing" titleIcon={BoxTrendUp} className={className}>
      <PerformanceTabs topPerformers={topPerformers} />
    </DashboardCardContainer>
  );
};

export default PerformanceCard;

export const PerformanceTabs = ({ topPerformers }: { topPerformers?: any }) => {
  const [activeTab, setActiveTab] = useState<"contents" | "sellers">("contents");

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex gap-2 mb-4 border-b border-[#E6E6E6] shrink-0">
        {["contents", "sellers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "contents" | "sellers")}
            className={`py-[10px] px-[25px] rounded-[5px] text-center font-medium capitalize transition-colors
              ${activeTab === tab ? "bg-[#ECEBFF] text-[#5C59E8]" : "bg-transparent text-[#9E9E9E]"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1">
        {activeTab === "contents" && (
          <Contents data={topPerformers?.content ?? null} />
        )}
        {activeTab === "sellers" && (
          <Sellers data={topPerformers?.sellers ?? null} />
        )}
      </div>
    </div>
  );
};