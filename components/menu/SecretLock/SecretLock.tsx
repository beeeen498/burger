"use client"

import { useEffect, useState } from "react"
import styles from "./SecretLock.module.scss"

// ── localStorage key ──────────────────────────────────
const LS_BURGER_CLICKED = "secretMenu_burgerClicked"

export default function SecretLock() {
  const [show, setShow] = useState(false)

  // ── Only show if burger interaction is complete ──
  useEffect(() => {
    const completed = localStorage.getItem(LS_BURGER_CLICKED) === "yes"
    if (!completed) return

    // ── Short delay so page loads first ──
    const timer = setTimeout(() => {
      setShow(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <button className={styles.lock} aria-label="Secret menu">
      🔒
    </button>
  )
}