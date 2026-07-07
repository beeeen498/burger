"use client";

import { useState } from "react";
import Header from "../global/Header/Header";
import useCartStore from "@/lib/useCartStore";
import BackgroundCanvas from "../global/BackgroundCanvas/BackgroundCanvas";
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

  // ── Form fields ──
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ── Validation errors ──
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Validate form before showing payment ──
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (orderType === "delivery") {
      if (!name.trim())
        newErrors.name = "Hey! We need your name to deliver your burger 🍔";
      if (!street.trim()) newErrors.street = "Where are we delivering? 📍";
      if (!city.trim()) newErrors.city = "Which city are you in? 🏙️";
      if (!phone.trim())
        newErrors.phone = "We need your number in case we get lost 📞";
    }

    if (!email.trim()) {
      newErrors.email = "We need your email for the receipt 📧";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "That doesn't look like a real email 🤔";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    <main className={styles.page}>
      <div className={styles.headerWrap}>
        <Header />
      </div>

      <BackgroundCanvas />

      <div className={styles.pageContent}>
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
                <div className={styles.fieldGroup}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <span className={styles.error}>{errors.name}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Street Address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                  {errors.street && (
                    <span className={styles.error}>{errors.street}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  {errors.city && (
                    <span className={styles.error}>{errors.city}</span>
                  )}
                </div>
                <div className={styles.fieldGroup}>
                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errors.phone && (
                    <span className={styles.error}>{errors.phone}</span>
                  )}
                </div>
              </div>
            )}

            {/* ── Guest info — always visible ── */}
            <div className={styles.fieldGroup}>
              <input
                className={styles.input}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <span className={styles.error}>{errors.email}</span>
              )}
            </div>

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
                onClick={() => {
                  if (validateForm()) setShowPayment(true);
                }}
              >
                Proceed to Payment
              </button>
            )}

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
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.24 10.28V14.4h5.6c-.24 1.52-1.76 4.44-5.6 4.44-3.36 0-6.12-2.8-6.12-6.24s2.76-6.24 6.12-6.24c1.92 0 3.2.8 3.92 1.52l2.68-2.56C16.96 3.56 14.8 2.4 12.24 2.4 6.48 2.4 1.84 7.04 1.84 12.8s4.64 10.4 10.4 10.4c6 0 10-4.24 10-10.2 0-.68-.08-1.2-.16-1.72h-9.84z"
                        fill="currentColor"
                      />
                    </svg>
                    Google Pay
                  </button>

                  <button
                    className={styles.walletBtn}
                    onClick={() => alert("Demo only — Apple Pay")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.24 0-1.44.64-2.2.46-3.06-.4C3.79 16.17 4.36 9.53 8.87 9.26c1.28.07 2.17.72 2.92.76.93-.19 1.82-.87 3.12-.78 1.54.12 2.72.72 3.44 1.84-3.16 1.96-2.4 6.28.7 7.48-.56 1.32-1.28 2.64-2 3.72zM12.04 9.2c-.12-2.56 1.96-4.72 4.36-4.8.36 2.72-2.4 4.92-4.36 4.8z"
                        fill="currentColor"
                      />
                    </svg>
                    Apple Pay
                  </button>

                  <button
                    className={styles.walletBtn}
                    onClick={() => alert("Demo only — PayPal")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.08 21.6l.36-2.28.8-4.08h2.08c3.28 0 5.88-2.12 6.56-5.48.28-1.36.16-2.52-.28-3.4.6-.04 1.16 0 1.64.12.4.12.76.28 1.08.52.68.96.8 2.36.44 4.08-.68 3.36-3.28 5.48-6.56 5.48H11.6l-.8 4.08-.36 2.28H7.08z"
                        fill="currentColor"
                        opacity="0.7"
                      />
                      <path
                        d="M6.24 21.6l.36-2.28.8-4.08h2.08c3.28 0 5.88-2.12 6.56-5.48.28-1.36.16-2.52-.28-3.4-.48-.96-1.4-1.6-2.72-1.8-.4-.08-.84-.12-1.32-.12H7.04L4.8 19.32l-.36 2.28h1.8z"
                        fill="currentColor"
                      />
                    </svg>
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
      </div>
    </main>
  );
};

export default CheckoutPage;
