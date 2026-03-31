"use client";

import React from "react";
import Image from "next/image";
import { sellerMiniImg, userAvatar } from "@/lib/utils";

interface SellersProps {
  data?: any[] | null;
}

const Sellers = ({ data }: SellersProps) => {
  if (!data) return null;

  return (
    <div className="w-full flex flex-col gap-6 py-4">
      {data.map((item: any, i: number) => (
        <SellerItem
          key={item.id || i}
          name={item?.business_name || `${item?.first_name} ${item?.last_name}`}
          subtitle={`${item?.followers_count ?? 0} Followers`}
          orders={item?.orders_count ?? 0}
          image={item?.creator_image}
        />
      ))}
    </div>
  );
};

export default Sellers;

export const SellerItem = ({
  name,
  subtitle,
  orders,
  image,
  classname,
}: {
  name?: string;
  subtitle?: string;
  orders?: number;
  image?: string;
  classname?: string;
}) => {
  return (
    <div className={`w-full flex justify-between items-center pb-2.5 ${classname}`}>
      <div className="flex items-center gap-2.5 sm:gap-4">
        <Image src={image || userAvatar} alt="seller" width={40} height={40} className="rounded-full object-cover w-10 h-10" />
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-medium mb-1 truncate">{name}</h3>
          <p className="text-[#9E9E9E] text-xs">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Image src="/images/shopping-cart.svg" alt="orders" width={14} height={14} /> {orders} Orders
        </span>
        {/* <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users size={14} />
        </span> */}
      </div>
    </div>
  );
};