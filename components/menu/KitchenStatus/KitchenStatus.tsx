"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import styles from "./KitchenStatus.module.scss"

interface Settings {
  opening_time: string
  closing_time: string
  is_manually_closed: boolean
}

// ── Status type ──
type KitchenStatus = "open" | "closingSoon" | "closed" | null

export default function KitchenStatus() {
  const [status, setStatus] = useState<KitchenStatus>(null)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("restaurant_settings")
        .select("opening_time, closing_time, is_manually_closed")
        .single()

      if (!data) return
      setStatus(getKitchenStatus(data))
    }

    fetchSettings()

    // ── Realtime updates ──
    const channel = supabase
      .channel("kitchen_status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_settings" },
        () => fetchSettings()
      )
      .subscribe()

    // ── Re-check every minute in case status changes ──
    const interval = setInterval(fetchSettings, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  // ── Don't render until we have data ──
  if (status === null) return null

  // ── Status config ──
  const config = {
    open:        { label: "Kitchen is open",         className: styles.open },
    closingSoon: { label: "Kitchen is closing soon", className: styles.closingSoon },
    closed:      { label: "Kitchen is closed",       className: styles.closed },
  }

  const { label, className } = config[status]

  return (
    <div className={`${styles.banner} ${className}`}>
      <span className={styles.dot} />
      <span className={styles.text}>{label}</span>
    </div>
  )
}

// ── Get kitchen status based on current time ──
function getKitchenStatus(settings: Settings): KitchenStatus {
  if (settings.is_manually_closed) return "closed"

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const [openHour, openMin] = settings.opening_time.split(":").map(Number)
  const [closeHour, closeMin] = settings.closing_time.split(":").map(Number)

  const openMinutes = openHour * 60 + openMin

  // ── Treat 00:00 as midnight (end of day = 1440 minutes) ──
  const closeMinutes = (closeHour === 0 && closeMin === 0)
    ? 24 * 60
    : closeHour * 60 + closeMin

  if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) return "closed"
  if (currentMinutes >= closeMinutes - 60) return "closingSoon"
  return "open"
}