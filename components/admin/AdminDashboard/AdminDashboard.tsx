"use client";

// ----- Admin Dashboard Home -----
// Overview stats, quick actions, recent orders, and orders per hour chart.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Order } from "../AdminOrders/AdminOrders";
import styles from "./AdminDashboard.module.scss";

// -- Emoji based on pending order count --
function getBusyEmoji(pending: number): { emoji: string; message: string } {
  if (pending === 0) return { emoji: "😴", message: "Quiet day Chef" };
  if (pending <= 3) return { emoji: "👨‍🍳", message: "Steady flow" };
  if (pending <= 6) return { emoji: "🔥", message: "It's getting spicy" };
  return { emoji: "🚨", message: "RUSH HOUR!" };
}

// -- Build orders-per-hour data from orders list --
function buildHourlyData(orders: Order[]) {
  // -- Create 24 hour slots --
  const hours: { hour: string; orders: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const label = i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`;
    hours.push({ hour: label, orders: 0 });
  }

  // -- Count orders per hour --
  orders.forEach((order) => {
    const h = new Date(order.placed_at).getHours();
    hours[h].orders += 1;
  });

  return hours;
}

// -- Bar colors based on order count --
function getBarColor(count: number): string {
  if (count === 0) return "var(--white)";
  if (count <= 2) return "var(--blue)";
  if (count <= 5) return "var(--yellow)";
  return "var(--pink)";
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

  // -- Chart data --
  const hourlyData = buildHourlyData(orders);

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

      {/* ----- Orders per hour chart ----- */}
      <div className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Orders Per Hour</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fontFamily: "var(--body-font)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fontFamily: "var(--body-font)" }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: "var(--header-font)",
                  fontSize: "0.85rem",
                  border: "3px solid var(--black)",
                  borderRadius: 0,
                  boxShadow: "4px 4px 0 var(--black)",
                }}
              />
              <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.orders)} stroke="var(--black)" strokeWidth={2} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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