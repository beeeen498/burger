"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import styles from "./KitchenStatus.module.scss"

interface Settings {
  opening_time: string
  closing_time: string
  is_manually_closed: boolean
}

export default function KitchenStatus() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("restaurant_settings")
        .select("opening_time, closing_time, is_manually_closed")
        .single()

      if (!data) return
      setIsOpen(checkIfOpen(data))
    }

    fetchSettings()

    // ── Realtime updates ──
    const channel = supabase
      .channel("kitchen_status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restaurant_settings" },
        (payload) => {
          console.log("kitchen status update", payload)
          fetchSettings()
        }
      )
      .subscribe()

    // ── Re-check every minute in case opening/closing time passes ──
    const interval = setInterval(fetchSettings, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  // ── Don't render until we have data ──
  if (isOpen === null) return null

  return (
    <div className={`${styles.banner} ${isOpen ? styles.open : styles.closed}`}>
      <span className={styles.dot} />
      <span className={styles.text}>
        {isOpen ? "Kitchen is open" : "Kitchen is closed"}
      </span>
    </div>
  )
}

// ── Check if kitchen is open based on current time ──
function checkIfOpen(settings: Settings): boolean {
  if (settings.is_manually_closed) return false

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const [openHour, openMin] = settings.opening_time.split(":").map(Number)
  const [closeHour, closeMin] = settings.closing_time.split(":").map(Number)

  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}