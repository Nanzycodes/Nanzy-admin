import React from "react";
import Image from "next/image";
import { sellerMiniImg } from "@/lib/utils";

const Sellers = () => {
  const overviewRow = Array(4).fill(0);

  return (
    <div className="w-full h-[-webkit-fill-available] flex flex-col gap-6 py-6.5">
      {overviewRow.map((_, i) => (
        <div key={i} className="w-full">
          <SellerItem />
        </div>
      ))}
    </div>
  );
};

export default Sellers;

export const SellerItem = ({ classname }: { classname?: string }) => {
  return (
    <div
      className={`w-full flex justify-between items-center ${classname} pb-2.5 `}
    >
      <div className="flex items-center gap-2.5 sm:gap-4.5">
        <Image src={sellerMiniImg} alt="home-alt" />
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-medium mb-1 truncate">
            Victoria Selyefa
          </h3>
          <p className="text-[#9E9E9E] text-xs">10 Followers, 100 Reviews</p>
        </div>
      </div>

      <span className=" text-sm ">Posted by Olamade</span>
    </div>
  );
};
