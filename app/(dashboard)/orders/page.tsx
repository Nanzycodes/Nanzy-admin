"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import OrdersTable from "@/components/orders/orders-table";
import OrderDetailsModal from "@/components/orders/orders-details-modal";
import { OrderDetail, OrderStatus } from "@/types/order";
import {
  DemoDataMode,
  getDemoDataMode,
  isDemoSession,
  subscribeToDemoSession,
} from "@/lib/demo-mode";
import { getDemoOrders, saveDemoOrders } from "@/lib/demo-orders";

export default function OrdersPage() {
  const demoSession = useSyncExternalStore(
    subscribeToDemoSession,
    isDemoSession,
    () => false,
  );
  const demoDataMode = useSyncExternalStore<DemoDataMode>(
    subscribeToDemoSession,
    getDemoDataMode,
    () => "sample",
  );
  const [demoOrders, setDemoOrders] = useState<OrderDetail[]>([]);
  const [demoOrdersError, setDemoOrdersError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!demoSession) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        setDemoOrders(getDemoOrders(demoDataMode));
        setDemoOrdersError(null);
      } catch (error) {
        setDemoOrdersError(
          error instanceof Error ? error.message : "Could not load saved demo orders.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [demoSession, demoDataMode]);

  function handleViewDetails(order: OrderDetail) {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  }

  function updateDemoOrderStatus(id: string, status: OrderStatus) {
    const updatedAt = new Date().toISOString();
    const next = demoOrders.map((order) => {
      if (order.id !== id) return order;
      return {
        ...order,
        status,
        updated_at: updatedAt,
        ...(status === "IN_TRANSIT" || status === "SHIPPED"
          ? { shipped_at: updatedAt }
          : {}),
        ...(status === "DELIVERED"
          ? {
              delivery_confirmed_at: updatedAt,
              delivery_confirmed_by: order.customer,
              is_escrow_active: false,
            }
          : {}),
      };
    });
    try {
      saveDemoOrders(demoDataMode, next);
      setDemoOrders(next);
      setDemoOrdersError(null);
    } catch (error) {
      setDemoOrdersError(
        error instanceof Error ? error.message : "Could not save the demo order update.",
      );
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">Analysis of orders</p>
      </div>

      {demoSession && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Demo orders are saved in this browser. Status changes do not affect live marketplace data.
        </p>
      )}
      {demoOrdersError && (
        <p role="alert" className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {demoOrdersError}
        </p>
      )}
      <OrdersTable
        onViewDetails={handleViewDetails}
        demoOrders={demoSession ? demoOrders : undefined}
        onUpdateDemoStatus={demoSession ? updateDemoOrderStatus : undefined}
      />

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