import React from "react";
import Image from "next/image";
import DashboardCardContainer from "./card-container";
import { BoxTealTime, TealPackage } from "@/lib/utils";

const RecentActivities = ({ className = "" }: { className?: string }) => {
  const activities = [
    { id: 1, text: "Urban styles just signed up and listed 5products", time: "5mins ago" },
    { id: 2, text: "Urban styles just signed up and listed 5products", time: "5mins ago" },
  ];

  return (
    <DashboardCardContainer cardTitle="Recent Activity" titleIcon={BoxTealTime} className={className}>
      <div className="flex flex-col gap-4 py-2">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-2">
            <div className="flex gap-3">
              <div className="bg-[#F5F5F5] p-2 rounded-[5px] shrink-0 flex items-center justify-center border border-[#F0F0F0]">
                <Image src={TealPackage} alt="package" width={16} height={16} />
              </div>
              <p className="text-[13px] text-[#424242] leading-tight max-w-[170px]">
                {item.text}
              </p>
            </div>
            <span className="text-[11px] text-[#9E9E9E] font-medium whitespace-nowrap pt-0.5">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </DashboardCardContainer>
  );
};

export default RecentActivities;