"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../global/Header/Header";
import BackgroundCanvas from "../../global/BackgroundCanvas/BackgroundCanvas";
import useOrderStore from "@/lib/useOrderStore";
import useCartStore from "@/lib/useCartStore";
import { toast } from "sonner";
import styles from "./OrderConfirmationPage.module.scss";

const OrderConfirmationPage = () => {
  const router = useRouter();
  const { orderData } = useOrderStore();
  const { clearCart } = useCartStore();

  // ── Clear cart once on arrival (not the order data) ──
  const hasCleared = useRef(false);

  // ── Copy-to-clipboard state for referral code ──
  const [copied, setCopied] = useState(false);

  // ── Referral code (fake, for demo) ──
  const referralCode = "SMASH-20";

  // ── Redirect if no order data exists ──
  useEffect(() => {
    if (!orderData) {
      router.replace("/menu");
    }
  }, [orderData, router]);

  // ── Clear cart once on arrival ──
  useEffect(() => {
    if (orderData && !hasCleared.current) {
      hasCleared.current = true;
      clearCart();
    }
  }, [orderData, clearCart]);

  // ── Don't render until we have data ──
  if (!orderData) return null;

  // ── Calculate checkout speed ──
  const checkoutSeconds = Math.round(
    (orderData.placedAt - orderData.checkoutStartedAt) / 1000,
  );
  const checkoutMinutes = Math.floor(checkoutSeconds / 60);
  const checkoutRemainder = checkoutSeconds % 60;
  const speedText =
    checkoutMinutes > 0
      ? `${checkoutMinutes}m ${checkoutRemainder}s`
      : `${checkoutSeconds}s`;

  // ── Format the order date ──
  const orderDate = new Date(orderData.placedAt);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = orderDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Estimated time ──
  const estimatedTime =
    orderData.method === "delivery" ? "30-45 min" : "15-20 min";

  // ── Copy referral code to clipboard ──
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Copied! Share the burger love 🍔");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try manually!");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.headerWrap}>
        <Header />
      </div>

      <BackgroundCanvas />

      {/* ── Confetti pieces ── */}
      <div className={styles.confetti} aria-hidden="true">
        {Array.from({ length: 80 }).map((_, i) => (
          <span key={i} className={styles.piece} />
        ))}
      </div>

      <div className={styles.pageContent}>
        {/* ── Hero heading ── */}
        <div className={styles.hero}>
          <h1>ORDER SMASH&apos;D!</h1>
          <p className={styles.subtitle}>
            Your burger is being prepared with love and extra cheese.
          </p>
        </div>

        {/* ── Receipt card ── */}
        <div className={styles.receipt}>
          {/* ── Receipt header ── */}
          <div className={styles.receiptHeader}>
            <h2>SMASH&apos;D</h2>
            <p>Order #{orderData.orderNumber}</p>
            <p>
              {formattedDate} — {formattedTime}
            </p>
          </div>

          <div className={styles.dashedLine} />

          {/* ── Items list ── */}
          <div className={styles.receiptItems}>
            {orderData.items.map((item) => (
              <div key={item.id} className={styles.receiptRow}>
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.dashedLine} />

          {/* ── Totals breakdown ── */}
          <div className={styles.receiptTotals}>
            <div className={styles.receiptRow}>
              <span>Subtotal</span>
              <span>${orderData.subtotal.toFixed(2)}</span>
            </div>

            {orderData.deliveryFee > 0 && (
              <div className={styles.receiptRow}>
                <span>Delivery Fee</span>
                <span>${orderData.deliveryFee.toFixed(2)}</span>
              </div>
            )}

            {orderData.tip > 0 && (
              <div className={styles.receiptRow}>
                <span>Tip</span>
                <span>${orderData.tip.toFixed(2)}</span>
              </div>
            )}

            {orderData.discount > 0 && (
              <div className={styles.receiptRow}>
                <span>Discount</span>
                <span>-${orderData.discount.toFixed(2)}</span>
              </div>
            )}

            <div className={`${styles.receiptRow} ${styles.totalRow}`}>
              <span>TOTAL</span>
              <span>${orderData.total.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.dashedLine} />

          {/* ── Delivery / pickup info ── */}
          <div className={styles.receiptFooter}>
            <p>
              <strong>
                {orderData.method === "delivery"
                  ? "🚗 Delivery"
                  : "🏃 Pickup"}
              </strong>
            </p>
            <p>
              {orderData.method === "delivery"
                ? orderData.address
                : "Pick up at: Smash'd HQ"}
            </p>
            <p className={styles.eta}>
              Estimated: <strong>{estimatedTime}</strong>
            </p>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className={styles.actions}>
          <Link href="/menu" className={styles.menuBtn}>
            Back to Menu
          </Link>

          <button
            className={styles.trackBtn}
            onClick={() => toast.info("Demo only — no real tracking 🛰️")}
          >
            Track Order
          </button>
        </div>

        {/* ── Refer a friend ── */}
        <div className={styles.referral}>
          <h3>Share the love 💕</h3>
          <p>Give a friend 20% off their first order:</p>
          <div className={styles.codeRow}>
            <span className={styles.code}>{referralCode}</span>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? "Copied! ✅" : "Copy 📋"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;