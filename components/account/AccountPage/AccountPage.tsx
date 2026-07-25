"use client";

// ----- Customer Account Page -----
// Shows user info and their order history.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/global/Header/Header";
import Link from "next/link";
import styles from "./AccountPage.module.scss";

// -- Order type --
interface Order {
  id: string;
  order_number: string;
  status: string;
  items: string;
  total: number;
  method: string;
  placed_at: string;
}

// -- Status labels --
const STATUS_INFO: Record<string, { label: string; emoji: string }> = {
  received: { label: "Received", emoji: "🆕" },
  preparing: { label: "Preparing", emoji: "👨‍🍳" },
  ready: { label: "Ready", emoji: "✅" },
  delivered: { label: "Delivered", emoji: "📦" },
};

export default function AccountPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // -- Check auth + fetch orders --
  useEffect(() => {
    const fetchData = async () => {
      // -- Get current user --
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/account/login");
        return;
      }

      setUserName(user.user_metadata?.full_name ?? "Chef");

      // -- Fetch user's orders --
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, order_number, status, items, total, method, placed_at")
        .eq("user_id", user.id)
        .order("placed_at", { ascending: false });

      if (orderData) setOrders(orderData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // -- Handle logout --
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // -- Parse items JSON --
  const parseItems = (items: string) => {
    try {
      return JSON.parse(items);
    } catch {
      return [];
    }
  };

  // -- Format date --
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // -- Format time --
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return null;

  return (
    <div className={styles.accountPage}>
      {/* -- Header -- */}
      <div className={styles.headerWrap}>
        <Header />
      </div>

      <div className={styles.content}>
        {/* -- User info -- */}
        <div className={styles.userSection}>
          <h1 className={styles.greeting}>Hey, {userName}! 👋</h1>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* -- Order history -- */}
        <div className={styles.ordersSection}>
          <h2 className={styles.sectionTitle}>Your Orders</h2>

          {orders.length === 0 ? (
            <div className={styles.empty}>
              <p>No orders yet — time to fix that!</p>
              <Link href="/menu" className={styles.menuLink}>
                Browse Menu 🍔
              </Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  {/* -- Order header -- */}
                  <div className={styles.orderHeader}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>
                        {order.order_number}
                      </span>
                      <span className={styles.orderDate}>
                        {formatDate(order.placed_at)} at {formatTime(order.placed_at)}
                      </span>
                    </div>
                    <span className={styles.statusBadge}>
                      {STATUS_INFO[order.status]?.emoji}{" "}
                      {STATUS_INFO[order.status]?.label}
                    </span>
                  </div>

                  {/* -- Items -- */}
                  <div className={styles.itemsList}>
                    {parseItems(order.items).map(
                      (item: { name: string; quantity: number }, i: number) => (
                        <span key={i} className={styles.item}>
                          {item.quantity}x {item.name}
                        </span>
                      )
                    )}
                  </div>

                  {/* -- Footer -- */}
                  <div className={styles.orderFooter}>
                    <span className={styles.method}>
                      {order.method === "delivery" ? "🚗 Delivery" : "🏃 Pickup"}
                    </span>
                    <span className={styles.total}>
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}