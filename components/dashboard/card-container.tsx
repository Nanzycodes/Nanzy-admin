"use client";

import Image, { StaticImageData } from "next/image";
import React from "react";
import { BoxDiagonalArrow } from "@/lib/utils";

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
  return (
    <div className={`px-4 py-3 bg-white border border-border rounded-[5px] h-fit ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-x-2 items-center">
          <Image src={titleIcon} alt="icons" width={20} height={20} />
          <p className="font-medium text-[#1A1A1A]">{cardTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Image src={BoxDiagonalArrow} alt="icons" className="cursor-pointer" />
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default DashboardCardContainer;