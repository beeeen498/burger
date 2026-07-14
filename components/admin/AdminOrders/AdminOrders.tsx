"use client";

// ----- Admin Orders Page -----
// Shows all orders with status management. Updates live via Supabase Realtime.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./AdminOrders.module.scss";

// -- Order type matching our Supabase table --
export interface Order {
  id: string;
  order_number: string;
  status: string;
  items: string;
  subtotal: number;
  delivery_fee: number;
  tip: number;
  discount: number;
  total: number;
  method: string;
  customer_name: string;
  customer_email: string;
  address: string | null;
  placed_at: string;
}

// -- Status flow --
const STATUS_FLOW = ["received", "preparing", "ready", "delivered"];

// -- Status labels and emoji --
const STATUS_INFO: Record<string, { label: string; emoji: string }> = {
  received: { label: "Received", emoji: "🆕" },
  preparing: { label: "Preparing", emoji: "👨‍🍳" },
  ready: { label: "Ready", emoji: "✅" },
  delivered: { label: "Delivered", emoji: "📦" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // -- Fetch all orders on mount --
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("placed_at", { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();

    // -- Listen for realtime changes --
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // -- New order comes in — add to top of list --
            setOrders((prev) => [payload.new as Order, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            // -- Order status changed — update in place --
            setOrders((prev) =>
              prev.map((order) =>
                order.id === (payload.new as Order).id
                  ? (payload.new as Order)
                  : order,
              ),
            );
          }
        },
      )
      .subscribe();

    // -- Cleanup on unmount --
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -- Advance order to next status --
  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex >= STATUS_FLOW.length - 1) return;

    const nextStatus = STATUS_FLOW[currentIndex + 1];

    await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId);
  };

  // -- Parse items JSON --
  const parseItems = (items: string) => {
    try {
      return JSON.parse(items);
    } catch {
      return [];
    }
  };

  // -- Format time --
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className={styles.ordersPage}>
      <h2 className={styles.pageTitle}>Orders</h2>

      {orders.length === 0 ? (
        <p className={styles.empty}>
          No orders yet. Time to spread the word! 📣
        </p>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div
              key={order.id}
              className={`${styles.orderCard} ${styles[order.status]}`}
            >
              {/* -- Order header -- */}
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderNumber}>
                    {order.order_number}
                  </span>
                  <span className={styles.orderTime}>
                    {formatTime(order.placed_at)}
                  </span>
                </div>
                <span className={styles.statusBadge}>
                  {STATUS_INFO[order.status]?.emoji}{" "}
                  {STATUS_INFO[order.status]?.label}
                </span>
              </div>

              {/* -- Customer info -- */}
              <div className={styles.customerInfo}>
                <span>{order.customer_name}</span>
                <span className={styles.method}>
                  {order.method === "delivery" ? "🚗 Delivery" : "🏃 Pickup"}
                </span>
              </div>

              {/* -- Items list -- */}
              <div className={styles.itemsList}>
                {parseItems(order.items).map(
                  (
                    item: {
                      name: string;
                      quantity: number;
                      ingredients?: Record<string, unknown>;
                      sideItems?: string[];
                    },
                    i: number,
                  ) => (
                    <div key={i} className={styles.item}>
                      <span className={styles.itemName}>
                        {item.quantity}x {item.name}
                      </span>

                      {/* -- Custom ingredients if present -- */}
                      {item.ingredients && (
                        <span className={styles.itemExtras}>
                          {Object.entries(item.ingredients)
                            .filter(
                              ([, val]) => val && val !== 0 && val !== "none",
                            )
                            .map(([key, val]) => {
                              const label = key
                                .replace(/([A-Z])/g, " $1")
                                .toLowerCase();
                              return typeof val === "number" && val > 1
                                ? `${label} x${val}`
                                : label;
                            })
                            .join(", ")}
                        </span>
                      )}

                      {/* -- Side items if present -- */}
                      {item.sideItems && item.sideItems.length > 0 && (
                        <span className={styles.itemExtras}>
                          +{" "}
                          {item.sideItems
                            .map((s: string) => s.replace(/_/g, " "))
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>

              {/* -- Order footer -- */}
              <div className={styles.orderFooter}>
                <span className={styles.total}>
                  ${Number(order.total).toFixed(2)}
                </span>

                {/* -- Advance status button -- */}
                {order.status !== "delivered" && (
                  <button
                    className={styles.advanceBtn}
                    onClick={() => advanceStatus(order.id, order.status)}
                  >
                    Move to{" "}
                    {
                      STATUS_INFO[
                        STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]
                      ]?.label
                    }{" "}
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
