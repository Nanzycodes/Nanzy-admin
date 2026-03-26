import { Triangle } from "lucide-react";
import React from "react";

interface OverviewWithTimeProps {
  label: string;
  value: string;
  trend: string;
}

export const OverviewWithTime = ({ label, value, trend }: OverviewWithTimeProps) => {
  return (
    <div className="bg-[#FFFFFF66] border border-[#fffefb] rounded-[5px] p-5 flex flex-col gap-6 w-full">
      <p className="capitalize text-[#616161]">{label}</p>
      <div className="flex flex-col gap-y-1">
        <span className="flex gap-x-1 items-center">
          <p className="text-[#616161]">{trend}</p>
          <Triangle fill="green" size={12} stroke="0" />
        </span>
        <h1 className="font-mono text-2xl font-bold">{value}</h1>
      </div>
    </div>
  );
};

export const DateDropdown = () => {
  return <div>misc</div>;
};