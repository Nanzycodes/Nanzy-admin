"use client";

import React, { useEffect, useState } from "react";
import DashboardCardContainer from "./card-container";
import { TealPackage } from "@/lib/utils";
import apiClient from "@/lib/apiclient";

const OrdersCard = ({ className = "", orderId }: { className?: string; orderId?: string | null }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !orderId) return;

    async function fetchOrderDetail() {
      setLoading(true);
      try {
        const res = await apiClient.get(`/admin/orders/${orderId}/`);
        setOrder(res.data?.data);
      } catch (err) {
        console.error("❌ OrdersCard: API Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetail();
  }, [orderId, mounted]);

  if (!mounted) return null;

  const customerName = order?.customer?.name || "---";
  const productTitle = order?.items?.[0]?.product?.title || "General";
  const totalPrice = order?.total_amount || 0;
  const status = order?.status || "PENDING";

  return (
    // We pass h-fit to ensure the card only grows as tall as its content
    <DashboardCardContainer cardTitle="Orders" titleIcon={TealPackage} className={`${className} h-fit`}>
      <div className={`py-1 transition-opacity duration-300 ${loading ? "opacity-40" : "opacity-100"}`}>
        
        {/* Order Header - Reduced margin */}
        <div className="flex justify-between items-center mb-2">
          <div className="min-w-0">
            <p className="text-[9px] text-[#9E9E9E] uppercase tracking-wide">
              Order Id
            </p>
            <p className="font-bold text-sm text-[#1A1A1A] truncate max-w-[120px]">
              {order?.id ? order.id.split('-')[0].toUpperCase() : "---"}
            </p>
          </div>
          <span className="bg-[#ECEBFF] text-[#5C59E8] text-[9px] px-2 py-0.5 rounded-[4px] font-bold uppercase">
            {status}
          </span>
        </div>

        {/* Divider - Minimal margin */}
        <div className="border-t border-[#F5F5F5] mb-2" />

        <p className="text-[10px] font-bold text-[#1A1A1A] mb-2">Order details</p>

        {/* 2x2 Details Grid - Reduced gap-y from 5 to 3 */}
        <div className="grid grid-cols-2 gap-y-3 pb-1">
          <div>
            <p className="text-[#9E9E9E] text-[9px] mb-0.5">Product</p>
            <p className="text-xs font-semibold text-[#424242] truncate">
              {productTitle}
            </p>
          </div>
          <div>
            <p className="text-[#9E9E9E] text-[9px] mb-0.5">Payment status</p>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-fit ${status === 'PAID' ? 'bg-[#E7F7EF] text-[#0E9343]' : 'bg-orange-50 text-orange-600'}`}>
              <div className={`w-1 h-1 rounded-full ${status === 'PAID' ? 'bg-[#0E9343]' : 'bg-orange-600'}`} />
              <span className="text-[9px] font-bold capitalize">
                {status === "PAID" ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[#9E9E9E] text-[9px] mb-0.5">Customer</p>
            <p className="text-xs font-semibold text-[#424242] truncate">
              {customerName}
            </p>
          </div>
          <div>
            <p className="text-[#9E9E9E] text-[9px] mb-0.5">Price</p>
            <p className="text-xs font-semibold text-[#424242]">
              NGN {Number(totalPrice).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </DashboardCardContainer>
  );
};

export default OrdersCard;