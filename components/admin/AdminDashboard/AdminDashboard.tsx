"use client";

// ----- Admin Dashboard Home -----
// Overview stats, quick actions, and recent orders.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Order } from "../AdminOrders/AdminOrders";
import styles from "./AdminDashboard.module.scss";

// -- Emoji based on pending order count --
function getBusyEmoji(pending: number): { emoji: string; message: string } {
  if (pending === 0) return { emoji: "😴", message: "Quiet day Chef" };
  if (pending <= 3) return { emoji: "👨‍🍳", message: "Steady flow" };
  if (pending <= 6) return { emoji: "🔥", message: "It's getting spicy" };
  return { emoji: "🚨", message: "RUSH HOUR!" };
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // -- Fetch today's orders --
  useEffect(() => {
    const fetchOrders = async () => {
      // -- Get start of today --
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("orders")
        .select("*")
        .gte("placed_at", today.toISOString())
        .order("placed_at", { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();

    // -- Realtime: refresh when orders change --
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -- Calculate stats --
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "received").length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const busy = getBusyEmoji(pendingOrders);

  // -- Recent 5 orders --
  const recentOrders = orders.slice(0, 5);

  // -- Format time --
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className={styles.dashboard}>
      {/* ----- Busy status ----- */}
      <div className={styles.busyStatus}>
        <span className={styles.busyEmoji}>{busy.emoji}</span>
        <span className={styles.busyMessage}>{busy.message}</span>
      </div>

      {/* ----- Stats row ----- */}
      <div className={styles.statsRow}>
        {/* -- Total orders today -- */}
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalOrders}</span>
          <span className={styles.statLabel}>Orders Today</span>
        </div>

        {/* -- Pending orders -- */}
        <div className={`${styles.statCard} ${styles.pending}`}>
          <span className={styles.statNumber}>{pendingOrders}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>

        {/* -- Revenue today -- */}
        <div className={styles.statCard}>
          <span className={styles.statNumber}>${revenue.toFixed(2)}</span>
          <span className={styles.statLabel}>Revenue Today</span>
        </div>
      </div>

      {/* ----- Quick actions ----- */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionLinks}>
          <Link href="/admin/orders" className={styles.actionLink}>
            🧾 View Orders
          </Link>
          <Link href="/admin/menu" className={styles.actionLink}>
            🍔 Manage Menu
          </Link>
          <Link href="/admin/settings" className={styles.actionLink}>
            ⚙️ Settings
          </Link>
        </div>
      </div>

      {/* ----- Recent orders ----- */}
      <div className={styles.recentOrders}>
        <h3 className={styles.sectionTitle}>Recent Orders</h3>

        {recentOrders.length === 0 ? (
          <p className={styles.empty}>No orders yet today.</p>
        ) : (
          <div className={styles.recentList}>
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.recentItem}>
                <div className={styles.recentLeft}>
                  <span className={styles.recentNumber}>
                    {order.order_number}
                  </span>
                  <span className={styles.recentName}>
                    {order.customer_name}
                  </span>
                </div>
                <div className={styles.recentRight}>
                  <span className={styles.recentTotal}>
                    ${Number(order.total).toFixed(2)}
                  </span>
                  <span className={styles.recentTime}>
                    {formatTime(order.placed_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}