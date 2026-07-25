"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./OrderStepper.module.scss";

// ── Step definitions ────────────────────────────────
const STEPS = ["received", "preparing", "ready", "delivered"] as const;

const STEP_LABELS: Record<string, string> = {
  received: "Order Received",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  delivered: "Delivered",
};

const STEP_ICONS: Record<string, string> = {
  received: "📋",
  preparing: "🍳",
  ready: "✅",
  delivered: "📦",
};

interface OrderStepperProps {
  supabaseOrderId: string;
}

const OrderStepper = ({ supabaseOrderId }: OrderStepperProps) => {
  const [status, setStatus] = useState<string>("received");

  // ── Fetch current status + subscribe to realtime changes ──
  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("id", supabaseOrderId)
        .maybeSingle();
      if (data?.status) setStatus(data.status);
    };

    fetchStatus();

    const channel = supabase
      .channel(`order-${supabaseOrderId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (
            (payload.new as any).id === supabaseOrderId &&
            payload.new?.status
          ) {
            setStatus(payload.new.status as string);
          }
        },
      )
      .subscribe((status) => {
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseOrderId]);

  // ── Current step index ──
  const currentIndex = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <div className={styles.stepper}>
      <h3 className={styles.title}>Order Status</h3>

      {/* ── Steps ── */}
      <div className={styles.steps}>
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step} className={styles.stepWrapper}>
              {/* ── Connector line ── */}
              {i > 0 && (
                <div
                  className={`${styles.connector} ${isCompleted || isCurrent ? styles.filled : ""}`}
                />
              )}

              {/* ── Step circle ── */}
              <div
                className={`${styles.circle} ${isCompleted ? styles.completed : ""} ${isCurrent ? styles.current : ""}`}
              >
                {isCompleted ? "✓" : STEP_ICONS[step]}
              </div>

              {/* ── Step label ── */}
              <span
                className={`${styles.label} ${isCompleted || isCurrent ? styles.active : ""}`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Ready message ── */}
      {status === "delivered" && (
        <p className={styles.readyMessage}>
          Your order has been delivered! Enjoy 🎉
        </p>
      )}
    </div>
  );
};

export default OrderStepper;
