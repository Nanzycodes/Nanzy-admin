"use client";

import { useState } from "react";
import OrdersTable from "@/components/orders/orders-table";
import OrderDetailsModal from "@/components/orders/orders-details-modal";
import { OrderDetail } from "@/types/order";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  function handleViewDetails(order: OrderDetail) {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">Overview of orders</p>
      </div>

      <OrdersTable onViewDetails={handleViewDetails} />

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}