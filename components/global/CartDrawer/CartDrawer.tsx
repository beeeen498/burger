"use client";

import { useRouter } from "next/navigation";
import useCartStore from "@/lib/useCartStore";
import { useEffect, useState } from "react";
import styles from "./CartDrawer.module.scss";

// ── Free delivery threshold ──
const FREE_DELIVERY_MIN = 30;

const CartDrawer = () => {
  const router = useRouter();
  const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart } =
    useCartStore();

  // ── Tracks whether the "are you sure?" confirmation is showing ──
  const [confirmClear, setConfirmClear] = useState(false);

  // ── Calculate the total price across all items ──
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ── How much more the user needs to spend for free delivery ──
  const remaining = Math.max(0, FREE_DELIVERY_MIN - total);
  const progress = Math.min(100, (total / FREE_DELIVERY_MIN) * 100);

  // ── Lock body scroll while cart drawer is open ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Don't render anything if the drawer is closed ──
  if (!isOpen) return null;

  return (
    <>
      {/* ── Dark overlay behind the drawer ── */}
      <div className={styles.overlay} onClick={toggleCart} />

      {/* ── Drawer panel ── */}
      <div className={styles.drawer}>
        {/* ── Header — title + close button ── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Your Bag</h2>
          <button className={styles.closeBtn} onClick={toggleCart}>
            ✕
          </button>
        </div>

        {/* ── Cart items list ── */}
        <div className={styles.itemsList}>
          {items.length === 0 ? (
            /* ── Empty state — sad burger illustration ── */
            <div className={styles.emptyState}>
              <svg
                className={styles.sadBurger}
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* ── Top bun ── */}
                <path
                  d="M20 50 C20 28, 100 28, 100 50 Z"
                  fill="#E8A020"
                  stroke="var(--black)"
                  strokeWidth="3"
                />

                {/* ── Sesame seeds ── */}
                <ellipse
                  cx="45"
                  cy="38"
                  rx="4"
                  ry="2.5"
                  fill="#F5E6C8"
                  transform="rotate(-15 45 38)"
                />
                <ellipse
                  cx="65"
                  cy="35"
                  rx="4"
                  ry="2.5"
                  fill="#F5E6C8"
                  transform="rotate(10 65 35)"
                />
                <ellipse
                  cx="80"
                  cy="42"
                  rx="3.5"
                  ry="2"
                  fill="#F5E6C8"
                  transform="rotate(-5 80 42)"
                />

                {/* ── Sad eyes ── */}
                <circle cx="44" cy="55" r="4" fill="var(--black)" />
                <circle cx="76" cy="55" r="4" fill="var(--black)" />

                {/* ── Sad eyebrows — angled inward ── */}
                <line
                  x1="36"
                  y1="46"
                  x2="48"
                  y2="48"
                  stroke="var(--black)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="84"
                  y1="46"
                  x2="72"
                  y2="48"
                  stroke="var(--black)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* ── Frown ── */}
                <path
                  d="M45 68 Q60 60, 75 68"
                  stroke="var(--black)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* ── Lettuce — wavy green layer ── */}
                <path
                  d="M16 72 Q25 66, 34 72 Q43 78, 52 72 Q61 66, 70 72 Q79 78, 88 72 Q97 66, 104 72"
                  stroke="#4A7C3F"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* ── Patty ── */}
                <rect
                  x="18"
                  y="76"
                  width="84"
                  height="12"
                  rx="3"
                  fill="#4A2810"
                  stroke="var(--black)"
                  strokeWidth="2.5"
                />

                {/* ── Bottom bun ── */}
                <path
                  d="M18 90 L102 90 C102 102, 18 102, 18 90 Z"
                  fill="#E8A020"
                  stroke="var(--black)"
                  strokeWidth="3"
                />
              </svg>

              <p className={styles.emptyMessage}>Your cart is lonely 🍔</p>
              <p className={styles.emptySubtext}>Add something tasty!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                {/* ── Item name and price ── */}
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* ── Quantity controls ── */}
                <div className={styles.itemActions}>
                  <div className={styles.quantity}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className={styles.qtyNum}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* ── Remove button ── */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer — delivery bar + total + checkout + clear ── */}
        {items.length > 0 && (
          <div className={styles.footer}>
            {/* ── Free delivery progress bar ── */}
            <div className={styles.deliveryBar}>
              <p className={styles.deliveryText}>
                {remaining > 0
                  ? `Add $${remaining.toFixed(2)} more for free delivery! 🚗`
                  : "You've got free delivery! 🎉"}
              </p>
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${progress >= 100 ? styles.complete : ""}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* ── Total row ── */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalPrice}>${total.toFixed(2)}</span>
            </div>

            {/* ── Checkout button — primary action ── */}
            <button className={styles.checkoutBtn}>Proceed to Checkout</button>

            {/* ── Clear cart — text link with confirmation ── */}
            {!confirmClear ? (
              <button
                className={styles.clearLink}
                onClick={() => setConfirmClear(true)}
              >
                Clear Cart
              </button>
            ) : (
              <div className={styles.confirmClear}>
                <p className={styles.confirmText}>
                  Are you sure?
                </p>
                <div className={styles.confirmBtns}>
                  <button
                    className={styles.confirmYes}
                    onClick={() => {
                      clearCart();
                      setConfirmClear(false);
                    }}
                  >
                    Yes, clear it
                  </button>
                  <button
                    className={styles.confirmNo}
                    onClick={() => setConfirmClear(false)}
                  >
                    Never mind
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
