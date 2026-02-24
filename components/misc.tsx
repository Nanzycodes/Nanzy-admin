import { Triangle } from "lucide-react";
import React from "react";

export const OverviewWithTime = () => {
  return (
    <div className="bg-[#FFFFFF66] border border-[#fffefb] rounded-[5px] p-5 flex flex-col gap-6 w-full">
      <p className="capitalize text-[#616161] ">total orders</p>

      <div className="flex flex-col gap-y-1">
        <span className="flex gap-x-1 items-center">
          <p className="text-[#616161]">3,982 since last month</p>
          <Triangle fill="green" size={12} stroke="0" />
        </span>

        <h1 className="font-mono text-2xl font-bold">145,760</h1>
      </div>
    </div>
  );
};

export const DateDropdown = () => {
  return <div>misc</div>;
};
