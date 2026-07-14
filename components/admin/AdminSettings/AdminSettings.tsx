"use client";

// ----- Admin Settings Page -----
// Kitchen status, opening hours, secret menu password, promo code.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import styles from "./AdminSettings.module.scss";

// -- Settings shape matching restaurant_settings table --
interface Settings {
  id: string;
  is_manually_closed: boolean;
  opening_time: string;
  closing_time: string;
  secret_menu_password: string | null;
  promo_code: string | null;
  promo_discount: number;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // -- Local form state --
  const [isClosed, setIsClosed] = useState(false);
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [secretPassword, setSecretPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

  // -- Fetch settings on mount --
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("restaurant_settings")
        .select("id, is_manually_closed, opening_time, closing_time, secret_menu_password, promo_code, promo_discount")
        .single();

      if (data) {
        setSettings(data);
        setIsClosed(data.is_manually_closed ?? false);
        setOpeningTime(data.opening_time ?? "");
        setClosingTime(data.closing_time ?? "");
        setSecretPassword(data.secret_menu_password ?? "");
        setPromoCode(data.promo_code ?? "");
        setPromoDiscount(data.promo_discount?.toString() ?? "0");
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  // -- Toggle kitchen open/closed --
  const toggleKitchen = async () => {
    if (!settings) return;

    const newValue = !isClosed;
    setIsClosed(newValue);

    await supabase
      .from("restaurant_settings")
      .update({ is_manually_closed: newValue })
      .eq("id", settings.id);

    toast.success(newValue ? "Kitchen closed 🔒" : "Kitchen open 🔓");
  };

  // -- Save opening hours --
  const saveHours = async () => {
    if (!settings) return;

    await supabase
      .from("restaurant_settings")
      .update({
        opening_time: openingTime,
        closing_time: closingTime,
      })
      .eq("id", settings.id);

    toast.success("Hours updated! ⏰");
  };

  // -- Save secret menu password --
  const savePassword = async () => {
    if (!settings) return;

    await supabase
      .from("restaurant_settings")
      .update({
        secret_menu_password: secretPassword || null,
        password_updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    toast.success("Secret password updated! 🤫");
  };

  // -- Save promo code --
  const savePromo = async () => {
    if (!settings) return;

    const discount = parseInt(promoDiscount);
    if (promoCode && (isNaN(discount) || discount < 0 || discount > 100)) {
      toast.error("Discount must be between 0 and 100");
      return;
    }

    await supabase
      .from("restaurant_settings")
      .update({
        promo_code: promoCode.toUpperCase() || null,
        promo_discount: promoCode ? discount : 0,
      })
      .eq("id", settings.id);

    toast.success("Promo code updated! 🎟️");
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className={styles.settingsPage}>
      <h2 className={styles.pageTitle}>Settings</h2>

      {/* ----- Kitchen Status ----- */}
      <div className={`${styles.card} ${isClosed ? styles.closed : styles.open}`}>
        <h3 className={styles.cardTitle}>Kitchen Status</h3>
        <p className={styles.cardDescription}>
          {isClosed
            ? "Kitchen is currently CLOSED. No orders will be accepted."
            : "Kitchen is OPEN and accepting orders."}
        </p>
        <button className={styles.kitchenToggle} onClick={toggleKitchen}>
          {isClosed ? "Open Kitchen 🔓" : "Close Kitchen 🔒"}
        </button>
      </div>

      {/* ----- Opening Hours ----- */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Opening Hours ⏰</h3>
        <p className={styles.cardDescription}>
          Changes reflect on the menu page banner and checkout time slots.
        </p>
        <div className={styles.hoursRow}>
          <label className={styles.timeLabel}>
            Opens
            <input
              className={styles.timeInput}
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
            />
          </label>
          <label className={styles.timeLabel}>
            Closes
            <input
              className={styles.timeInput}
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
            />
          </label>
          <button className={styles.saveBtn} onClick={saveHours}>
            Save Hours
          </button>
        </div>
      </div>

      {/* ----- Secret Menu Password ----- */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Secret Menu Password 🤫</h3>
        <p className={styles.cardDescription}>
          Set the daily password. Leave empty to disable the secret menu.
          Auto-expires at midnight.
        </p>
        <div className={styles.inputRow}>
          <input
            className={styles.textInput}
            type="text"
            placeholder="Enter secret password"
            value={secretPassword}
            onChange={(e) => setSecretPassword(e.target.value)}
          />
          <button className={styles.saveBtn} onClick={savePassword}>
            Save Password
          </button>
        </div>
      </div>

      {/* ----- Promo Code ----- */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Promo Code 🎟️</h3>
        <p className={styles.cardDescription}>
          Set an active promo code and discount percentage. Leave code empty to
          disable.
        </p>
        <div className={styles.inputRow}>
          <input
            className={styles.textInput}
            type="text"
            placeholder="Code (e.g. BURGERLORD50)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          />
          <input
            className={styles.numberInput}
            type="number"
            placeholder="% off"
            value={promoDiscount}
            onChange={(e) => setPromoDiscount(e.target.value)}
          />
          <button className={styles.saveBtn} onClick={savePromo}>
            Save Promo
          </button>
        </div>
      </div>
    </div>
  );
}