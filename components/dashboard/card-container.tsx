"use client";

import Image from "next/image";
import React, { useState } from "react";
import CustomDropdown from "../custom-dropdown";
import { CalendarRange } from "lucide-react";
import { BoxDiagonalArrow, periodOptions } from "@/lib/utils";

function DashboardCardContainer({
  cardTitle,
  titleIcon,
  children,
}: {
  cardTitle: string;
  titleIcon: string;
  children: React.ReactNode;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[1]);

  const handlePeriodChange = (val: string) => {
    setSelectedPeriod(periodOptions.find((opt) => opt.value === val)!);
  };

  return (
    <div className="px-4 py-3 bg-[#FFFFFF66] border border-[#fffefb] rounded-[5px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-x-2 items-center">
          <Image src={titleIcon} alt="icons" />
          <p>{cardTitle}</p>
        </div>

        <div className="flex items-center">
          <CustomDropdown
            icon={CalendarRange}
            value={selectedPeriod.value}
            options={periodOptions}
            onChange={handlePeriodChange}
          />
          <Image src={BoxDiagonalArrow} alt="icons" />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

export default DashboardCardContainer;
