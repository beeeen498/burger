"use client";

import Header from "../global/Header/Header";
import useCartStore from "@/lib/useCartStore";
import styles from "./CheckoutPage.module.scss";

const CheckoutPage = () => {
  const { items } = useCartStore();

  // ── Calculate subtotal from cart items ──
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <main>
      <Header />

      <div className={styles.page}>
        <h1>Checkout</h1>

        <div className={styles.columns}>
          {/* ── Left column — order summary ── */}
          <div className={styles.summary}>
            <h2>Your Order</h2>

            {items.map((item) => (
              <div key={item.id}>
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Right column — form (placeholder for now) ── */}
          <div className={styles.form}>
            <h2>Delivery Details</h2>
            <p>Form fields coming soon...</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
