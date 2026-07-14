"use client";

// ----- Admin Layout -----
// Sidebar + top bar shell that wraps all admin pages.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "./AdminLayout.module.scss";

// -- Sidebar nav links --
const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Orders", href: "/admin/orders", icon: "🧾" },
  { label: "Menu", href: "/admin/menu", icon: "🍔" },
  { label: "Challenge", href: "/admin/challenge", icon: "🏆" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

// -- Time-of-day greeting with order count --
function getGreeting(orderCount: number): string {
  const hour = new Date().getHours();
  let greeting = "";
  if (hour < 12) greeting = "Good morning Chef 🌅";
  else if (hour < 17) greeting = "Good afternoon Chef ☀️";
  else greeting = "Good evening Chef 🌙";

  if (orderCount === 0) return `${greeting} — all clear!`;
  if (orderCount === 1) return `${greeting} — you have 1 new order`;
  return `${greeting} — you have ${orderCount} new orders`;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [newOrderCount, setNewOrderCount] = useState(0);

  // -- Fetch count of "received" orders + listen for changes --
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "received");

      setNewOrderCount(count || 0);
    };

    fetchCount();

    // -- Realtime: update count when orders change --
    const channel = supabase
      .channel("orders-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -- Handle logout --
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className={styles.adminLayout}>
      {/* ----- Sidebar ----- */}
      <aside className={styles.sidebar}>
        {/* -- Brand -- */}
        <h2 className={styles.brand}>Smash'd 🍔</h2>
        <p className={styles.brandSub}>Admin Panel</p>

        {/* -- Nav Links -- */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href ? styles.active : ""
              }`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}

              {/* -- Notification badge on Orders -- */}
              {item.label === "Orders" && newOrderCount > 0 && (
                <span className={styles.badge}>{newOrderCount}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* -- Logout -- */}
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Log Out 👋
        </button>
      </aside>

      {/* ----- Main Content ----- */}
      <main className={styles.main}>
        {/* -- Top Bar -- */}
        <div className={styles.topBar}>
          <h1 className={styles.greeting}>{getGreeting(newOrderCount)}</h1>
        </div>

        {/* -- Page Content -- */}
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
