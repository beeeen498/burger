"use client";

// ----- Admin Layout -----
// Sidebar + top bar shell that wraps all admin pages.

import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "./AdminLayout.module.scss";

// -- Sidebar nav links --
const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Orders", href: "/admin/orders", icon: "🧾" },
  { label: "Menu", href: "/admin/menu", icon: "🍔" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

// -- Time-of-day greeting --
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning Chef 🌅";
  if (hour < 17) return "Good afternoon Chef ☀️";
  return "Good evening Chef 🌙";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
          <h1 className={styles.greeting}>{getGreeting()}</h1>
        </div>

        {/* -- Page Content -- */}
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
