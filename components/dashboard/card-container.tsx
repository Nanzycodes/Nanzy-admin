"use client";

import Image, { StaticImageData } from "next/image";
import React, { useState } from "react";
import CustomDropdown from "../custom-dropdown";
import { CalendarRange } from "lucide-react";
import { BoxDiagonalArrow, periodOptions } from "@/lib/utils";

function DashboardCardContainer({
  cardTitle,
  titleIcon,
  children,
  className = "",
}: {
  cardTitle: string;
  titleIcon: string | StaticImageData;
  children: React.ReactNode;
  className?: string;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[1]);

  const handlePeriodChange = (val: string) => {
    setSelectedPeriod(periodOptions.find((opt) => opt.value === val)!);
  };

  return (
    <div className={`px-4 py-3 bg-[#FFFFFF66] border border-[#fffefb] rounded-[5px] h-full flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex gap-x-2 items-center">
          <Image src={titleIcon} alt="icons" width={20} height={20} />
          <p className="font-medium text-[#1A1A1A]">{cardTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <CustomDropdown
            icon={CalendarRange}
            value={selectedPeriod.value}
            options={periodOptions}
            onChange={handlePeriodChange}
          />
          <Image src={BoxDiagonalArrow} alt="icons" className="cursor-pointer" />
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default DashboardCardContainer;