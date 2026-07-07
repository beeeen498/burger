"use client";

import { useState } from "react";
import Header from "../global/Header/Header";
import useCartStore from "@/lib/useCartStore";
import styles from "./CheckoutPage.module.scss";

const CheckoutPage = () => {
  const { items } = useCartStore();

  // ── Delivery or pickup selection ──
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");

  // ── Order notes with character limit ──
  const [notes, setNotes] = useState("");
  const MAX_NOTES = 200;

  // ── Tip selection ──
  const [tipPercent, setTipPercent] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");

  // ── Calculate subtotal from cart items ──
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ── Promo code ──
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">(
    "idle",
  );
  const [discount, setDiscount] = useState(0);

  // ── Calculate tip from subtotal ──
  const tipAmount =
    tipPercent !== null
      ? subtotal * (tipPercent / 100)
      : customTip
        ? parseFloat(customTip) || 0
        : 0;

  // ── Controls whether the payment section is visible ──
  const [showPayment, setShowPayment] = useState(false);

  // ── Delivery fee — free above threshold, otherwise $5 ──
  const deliveryFee = orderType === "pickup" ? 0 : subtotal >= 30 ? 0 : 5;

  // ── Discount amount ──
  const discountAmount =
    promoStatus === "valid" ? subtotal * (discount / 100) : 0;

  // ── Final total ──
  const total = subtotal - discountAmount + deliveryFee + tipAmount;

  // ── Payment form fields ──
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // ── Detect card brand from first digits ──
  const getCardBrand = (number: string) => {
    const n = number.replace(/\s/g, "");
    if (n.startsWith("4")) return "Visa";
    if (n.startsWith("5")) return "Mastercard";
    if (n.startsWith("3")) return "Amex";
    return null;
  };

  // ── Format card number with spaces every 4 digits ──
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // ── Format expiry as MM/YY ──
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

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

          {/* ── Right column — checkout form ── */}
          <div className={styles.form}>
            <h2>Delivery Details</h2>

            {/* ── Delivery vs Pickup toggle ── */}
            <div className={styles.orderTypeToggle}>
              <button
                className={`${styles.toggleBtn} ${orderType === "delivery" ? styles.active : ""}`}
                onClick={() => setOrderType("delivery")}
              >
                Delivery
              </button>
              <button
                className={`${styles.toggleBtn} ${orderType === "pickup" ? styles.active : ""}`}
                onClick={() => setOrderType("pickup")}
              >
                Pickup
              </button>
            </div>

            {/* ── Address fields — only visible for delivery ── */}
            {orderType === "delivery" && (
              <div className={styles.addressFields}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Full Name"
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Street Address"
                />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="City"
                />
                <input
                  className={styles.input}
                  type="tel"
                  placeholder="Phone Number"
                />
              </div>
            )}

            {/* ── Guest info — always visible ── */}
            <input
              className={styles.input}
              type="email"
              placeholder="Email Address"
            />

            {/* ── Order notes — special requests ── */}
            <div className={styles.notesField}>
              <textarea
                className={styles.textarea}
                placeholder="Any special requests? 🍔"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES))}
                rows={3}
              />
              <span className={styles.charCount}>
                {notes.length}/{MAX_NOTES}
              </span>
            </div>

            {/* ── Tip selection ── */}
            <div className={styles.tipSection}>
              <h3>Add a Tip</h3>

              {/* ── Preset tip buttons ── */}
              <div className={styles.tipButtons}>
                {[10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    className={`${styles.tipBtn} ${tipPercent === pct ? styles.active : ""}`}
                    onClick={() => {
                      setTipPercent(pct);
                      setCustomTip("");
                    }}
                  >
                    {pct}%
                  </button>
                ))}

                {/* ── Custom tip button ── */}
                <button
                  className={`${styles.tipBtn} ${tipPercent === null && customTip ? styles.active : ""}`}
                  onClick={() => setTipPercent(null)}
                >
                  Custom
                </button>
              </div>

              {/* ── Custom tip input — only shows when "Custom" is selected ── */}
              {tipPercent === null && (
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Enter tip amount ($)"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                />
              )}

              {/* ── Tip amount preview ── */}
              {tipAmount > 0 && (
                <p className={styles.tipPreview}>
                  Tip: ${tipAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* ── Promo code ── */}
            <div className={styles.promoSection}>
              <h3>Promo Code</h3>

              {/* ── Input + apply button row ── */}
              <div className={styles.promoRow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoStatus("idle");
                  }}
                />
                <button
                  className={styles.applyBtn}
                  onClick={() => {
                    if (promoCode === "BURGERLORD50") {
                      setPromoStatus("valid");
                      setDiscount(50);
                    } else {
                      setPromoStatus("invalid");
                      setDiscount(0);
                    }
                  }}
                >
                  Apply
                </button>
              </div>

              {/* ── Feedback message ── */}
              {promoStatus === "valid" && (
                <p className={styles.promoValid}>50% off applied! 🎉</p>
              )}
              {promoStatus === "invalid" && (
                <p className={styles.promoInvalid}>Invalid code 😢</p>
              )}
            </div>

            {/* ── Order total breakdown ── */}
            <div className={styles.totalBreakdown}>
              <div className={styles.breakdownRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {deliveryFee > 0 && (
                <div className={styles.breakdownRow}>
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}

              {tipAmount > 0 && (
                <div className={styles.breakdownRow}>
                  <span>Tip</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className={styles.breakdownRow}>
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* ── Proceed to Payment button ── */}
            {!showPayment && (
              <button
                className={styles.paymentBtn}
                onClick={() => setShowPayment(true)}
              >
                Proceed to Payment
              </button>
            )}
          </div>

          {/* ── Payment section — appears after clicking Proceed to Payment ── */}
          {showPayment && (
            <div className={styles.paymentSection}>
              <h3>Payment</h3>

              {/* ── Wallet buttons ── */}
              <div className={styles.walletButtons}>
                <button
                  className={styles.walletBtn}
                  onClick={() => alert("Demo only — Google Pay")}
                >
                  Google Pay
                </button>
                <button
                  className={styles.walletBtn}
                  onClick={() => alert("Demo only — Apple Pay")}
                >
                  Apple Pay
                </button>
                <button
                  className={styles.walletBtn}
                  onClick={() => alert("Demo only — PayPal")}
                >
                  PayPal
                </button>
              </div>

              {/* ── Or divider ── */}
              <div className={styles.divider}>
                <span>or pay with card</span>
              </div>

              {/* ── Card form ── */}
              <div className={styles.cardForm}>
                {/* ── Card number + brand detection ── */}
                <div className={styles.cardNumberRow}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                  />
                  {getCardBrand(cardNumber) && (
                    <span className={styles.cardBrand}>
                      {getCardBrand(cardNumber)}
                    </span>
                  )}
                </div>

                {/* ── Expiry + CVV side by side ── */}
                <div className={styles.cardDetails}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                  />
                </div>
              </div>

              {/* ── Place Order button ── */}
              <button
                className={styles.placeOrderBtn}
                onClick={() => alert("Order placed! 🍔 (Demo)")}
              >
                Place Order — ${total.toFixed(2)}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
