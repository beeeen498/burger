'use client'

import { useEffect, useState } from "react"
import useCartStore from "@/lib/useCartStore"
import styles from "./FlyingItem.module.scss"

// ── Types ───────────────────────────────────────────────────
interface FlyCoords {
  startX: number
  startY: number
  endX: number
  endY: number
}

const FlyingItem = () => {
  const flyFrom = useCartStore((s) => s.flyFrom)
  const setFlyFrom = useCartStore((s) => s.setFlyFrom)
  const setWobble = useCartStore((s) => s.setWobble)

  // ── Local state for the animation coordinates ─────────────
  const [coords, setCoords] = useState<FlyCoords | null>(null)

  // ── When flyFrom changes, calculate start + end positions ─
  useEffect(() => {
    if (!flyFrom) return

    // Find the bag icon in the header
    const bagIcon = document.querySelector("[data-bag-icon]")
    if (!bagIcon) {
      setFlyFrom(null)
      return
    }

    // Get bag icon's position on screen
    const bagRect = bagIcon.getBoundingClientRect()

    setCoords({
      startX: flyFrom.x,
      startY: flyFrom.y,
      endX: bagRect.left + bagRect.width / 2,
      endY: bagRect.top + bagRect.height / 2,
    })
  }, [flyFrom, setFlyFrom])

  // ── When animation ends, clean up and trigger wobble ──────
  const handleAnimationEnd = () => {
    setCoords(null)
    setFlyFrom(null)
    setWobble(true)
  }

  // ── Nothing to show if no animation is happening ──────────
  if (!coords) return null

  // ── Calculate how far the emoji needs to travel ───────────
  const deltaX = coords.endX - coords.startX
  const deltaY = coords.endY - coords.startY

  return (
    <span
      className={styles.flyingItem}
      onAnimationEnd={handleAnimationEnd}
      style={{
        left: coords.startX,
        top: coords.startY,
        // CSS variables so the keyframes know where to go
        "--fly-x": `${deltaX}px`,
        "--fly-y": `${deltaY}px`,
      } as React.CSSProperties}
    >
      🍔
    </span>
  )
}

export default FlyingItem