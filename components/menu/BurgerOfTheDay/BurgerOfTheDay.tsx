"use client"

import { useEffect, useState } from "react"
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas"
import { BurgerIngredients } from "@/lib/burgerUtils"
import styles from "./BurgerOfTheDay.module.scss"

// ── Hardcoded for now — will come from Supabase later ──
const MOCK_BURGER: BurgerIngredients = {
  bunType: "regular",
  sauce: "regular",
  pattyCount: 2,
  cheeseCount: 2,
  bacon: 1,
  onionRings: 1,
  friedEgg: 1,
  lettuce: 1,
  tomato: 1,
  pickles: 1,
  onions: 1,
  nuggets: 0,
  friedFish: 0,
  potatoChips: 0,
}

export default function BurgerOfTheDay() {

  // ── Countdown timer state ──
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // ── Calculate time left until midnight ──
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()

      setTimeLeft({
        hours:   Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className={styles.banner}>

      {/* ── Badge — top right corner ── */}
      <span className={styles.badge}>Burger of the Day</span>

      {/* ── Left — 3D burger ── */}
      <div className={styles.left}>
        <BurgerCanvas
          ingredients={MOCK_BURGER}
          cameraOffset={14}
          scale={0.18}
        />
      </div>

      {/* ── Right — details ── */}
      <div className={styles.right}>
        <p className={styles.title}>Today's Special</p>
        <h2 className={styles.name}>The Smash'd Special</h2>
        <p className={styles.description}>The one that started it all. Chef's pick, no questions asked.</p>

        {/* ── Price ── */}
        <div className={styles.priceRow}>
          <span className={styles.oldPrice}>$16.99</span>
          <span className={styles.newPrice}>$12.99</span>
        </div>

        {/* ── Countdown ── */}
        <div className={styles.countdown}>
          <span className={styles.countdownLabel}>Ends in</span>
          <div className={styles.timer}>
            <div className={styles.timeBlock}>
              <span className={styles.timeNum}>{pad(timeLeft.hours)}</span>
              <span className={styles.timeLabel}>hrs</span>
            </div>
            <span className={styles.timeSep}>:</span>
            <div className={styles.timeBlock}>
              <span className={styles.timeNum}>{pad(timeLeft.minutes)}</span>
              <span className={styles.timeLabel}>min</span>
            </div>
            <span className={styles.timeSep}>:</span>
            <div className={styles.timeBlock}>
              <span className={styles.timeNum}>{pad(timeLeft.seconds)}</span>
              <span className={styles.timeLabel}>sec</span>
            </div>
          </div>
        </div>

        {/* ── Add to cart ── */}
        <button className={styles.addBtn}>Add to Cart</button>
      </div>

    </div>
  )
}