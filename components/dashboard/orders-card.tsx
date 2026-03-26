"use client";

import React from "react";
import DashboardCardContainer from "./card-container";
import { TealPackage } from "@/lib/utils";

const OrdersCard = ({ className = "" }: { className?: string }) => {
  return (
    <DashboardCardContainer cardTitle="Orders" titleIcon={TealPackage} className={className}>
      <div className="py-2">

        {/* Order Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wide mb-0.5">
              Order Id
            </p>
            <p className="font-bold text-sm text-[#1A1A1A]">BE-23456 GHF</p>
          </div>
          <span className="bg-[#ECEBFF] text-[#5C59E8] text-[10px] px-3 py-1 rounded-[4px] font-bold">
            New
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F5F5F5] mb-4" />

        <p className="text-xs font-bold text-[#1A1A1A] mb-4">Order details</p>

        {/* 2x2 Details Grid */}
        <div className="grid grid-cols-2 gap-y-5">
          <div>
            <p className="text-[#9E9E9E] text-[10px] mb-1">Category</p>
            <p className="text-sm font-semibold text-[#424242]">Shoes</p>
          </div>
          <div>
            <p className="text-[#9E9E9E] text-[10px] mb-1">Payment status</p>
            <div className="flex items-center gap-1.5 bg-[#E7F7EF] text-[#0E9343] px-2.5 py-1 rounded-full w-fit">
              <div className="w-1.5 h-1.5 bg-[#0E9343] rounded-full" />
              <span className="text-[10px] font-bold">Paid</span>
            </div>
          </div>
          <div>
            <p className="text-[#9E9E9E] text-[10px] mb-1">Quantity</p>
            <p className="text-sm font-semibold text-[#424242]">2</p>
          </div>
          <div>
            <p className="text-[#9E9E9E] text-[10px] mb-1">Price</p>
            <p className="text-sm font-semibold text-[#424242]">NGN2,000</p>
          </div>
        </div>

      </div>
    </DashboardCardContainer>
  );
};

export default OrdersCard;