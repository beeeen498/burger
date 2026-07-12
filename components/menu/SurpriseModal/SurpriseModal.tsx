"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MenuItem } from "../MenuPage/MenuPage";
import BurgerCanvas from "@/components/global/BurgerCanvas/BurgerCanvas";
import SimpleModelCanvas from "@/components/global/SimpleModelCanvas/SimpleModelCanvas";
import styles from "./SurpriseModal.module.scss";

// ── Wheel colors — cycling through these ──
const WHEEL_COLORS = ["#df2c8b", "#f7e558", "#6bbbe8", "#c2ff8b"];

// ── Text colors for readability on each background ──
const TEXT_COLORS = ["#efefef", "#1a1a1a", "#1a1a1a", "#1a1a1a"];

interface SurpriseModalProps {
  items: MenuItem[];
  onClose: () => void;
}

export default function SurpriseModal({ items, onClose }: SurpriseModalProps) {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<MenuItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const hapticInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Wheel geometry ──
  const totalItems = items.length;
  const sliceAngle = 360 / totalItems;

  // ── Clean up haptic interval on unmount ──
  useEffect(() => {
    return () => {
      if (hapticInterval.current) clearInterval(hapticInterval.current);
    };
  }, []);

  // ── Spin the wheel ──
  const handleSpin = useCallback(() => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setShowResult(false);

    // ── Pick a random winner ──
    const winnerIndex = Math.floor(Math.random() * totalItems);
    const selectedItem = items[winnerIndex];

    // ── Calculate where that slice needs to land (under the top arrow) ──
    // The arrow is at the top (12 o'clock = 0deg)
    // Each slice starts at sliceAngle * index
    // We want the CENTER of the winning slice to land at the top
    const sliceCenter = sliceAngle * winnerIndex + sliceAngle / 2;
    // Rotation needed so that slice center aligns with 0deg (top)
    // We rotate clockwise, so we need (360 - sliceCenter) to bring it to top
    const targetOffset = 360 - sliceCenter;

    // ── Add 5-8 full spins for drama ──
    const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const totalRotation = rotation + fullSpins + targetOffset;

    // ── Round to avoid accumulation drift ──
    setRotation(totalRotation);

    // ── Haptic feedback on mobile — pulses that slow down ──
    if (navigator.vibrate) {
      let pulseSpeed = 50;
      hapticInterval.current = setInterval(() => {
        navigator.vibrate(10);
        pulseSpeed += 15;
        if (pulseSpeed > 300) {
          if (hapticInterval.current) clearInterval(hapticInterval.current);
        }
      }, pulseSpeed);
    }

    // ── Show result after spin finishes (matches CSS transition duration) ──
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(selectedItem);
      setShowResult(true);
      if (hapticInterval.current) clearInterval(hapticInterval.current);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 4500);
  }, [isSpinning, items, totalItems, sliceAngle, rotation]);

  // ── Spin again — reset result and spin ──
  const handleSpinAgain = () => {
    setShowResult(false);
    setWinner(null);
    // Small delay so result fades out before next spin
    setTimeout(() => handleSpin(), 300);
  };

  // ── Navigate to item page ──
  const handleViewItem = () => {
    if (winner) {
      onClose();
      router.push(`/menu/${winner.slug}`);
    }
  };

  // ── Close on backdrop click ──
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSpinning) {
      onClose();
    }
  };

  // ── Build SVG wheel slices ──
  const renderSlices = () => {
    const cx = 200;
    const cy = 200;
    const r = 195;

    return items.map((item, i) => {
      const startAngle = (sliceAngle * i * Math.PI) / 180;
      const endAngle = (sliceAngle * (i + 1) * Math.PI) / 180;
      const midAngle = (startAngle + endAngle) / 2;

      // ── Slice path ──
      const x1 = cx + r * Math.sin(startAngle);
      const y1 = cy - r * Math.cos(startAngle);
      const x2 = cx + r * Math.sin(endAngle);
      const y2 = cy - r * Math.cos(endAngle);
      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathD = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;

      // ── Color cycling ──
      const bgColor = WHEEL_COLORS[i % WHEEL_COLORS.length];
      const textColor = TEXT_COLORS[i % TEXT_COLORS.length];

      // ── Text position — along the middle of the slice, pushed outward ──
      const textRadius = r * 0.65;
      const textX = cx + textRadius * Math.sin(midAngle);
      const textY = cy - textRadius * Math.cos(midAngle);
      const textRotation = (midAngle * 180) / Math.PI;

      // ── Truncate long names ──
      const displayName =
        item.name.length > 14 ? item.name.slice(0, 13) + "…" : item.name;

      return (
        <g key={item.id}>
          {/* ── Slice ── */}
          <path d={pathD} fill={bgColor} stroke="#1a1a1a" strokeWidth="2" />

          {/* ── Label ── */}
          <text
            x={textX}
            y={textY}
            fill={textColor}
            fontSize={totalItems > 20 ? "7" : totalItems > 14 ? "8" : "10"}
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${textRotation + -90}, ${textX}, ${textY})`}
          >
            {displayName}
          </text>
        </g>
      );
    });
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        {/* ── Close button ── */}
        {!isSpinning && (
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        )}

        {/* ── Title ── */}
        <h2 className={styles.title}>
          {showResult ? "You got..." : "Feeling Lucky?"}
        </h2>

        {/* ── Wheel view ── */}
        {!showResult && (
          <div className={styles.wheelWrapper}>
            {/* ── Arrow pointer ── */}
            <div className={styles.arrow}>▼</div>

            {/* ── Wheel ── */}
            <svg
              viewBox="0 0 400 400"
              className={styles.wheel}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? "transform 4.5s cubic-bezier(0.15, 0.6, 0.15, 1)"
                  : "none",
              }}
            >
              {renderSlices()}

              {/* ── Center circle ── */}
              <circle
                cx="200"
                cy="200"
                r="30"
                fill="#1a1a1a"
                stroke="#1a1a1a"
                strokeWidth="2"
              />
              <circle
                cx="200"
                cy="200"
                r="20"
                fill="#f7e558"
                stroke="#1a1a1a"
                strokeWidth="2"
              />
            </svg>

            {/* ── Spin button ── */}
            {!isSpinning && (
              <button className={styles.spinBtn} onClick={handleSpin}>
                SPIN
              </button>
            )}
          </div>
        )}

        {/* ── Result view ── */}
        {showResult && winner && (
          <div className={styles.result}>
            {/* ── 3D model ── */}
            <div className={styles.modelWrapper}>
              {winner.ingredients ? (
                <BurgerCanvas
                  ingredients={winner.ingredients}
                  sideItems={winner.side_items ?? undefined}
                />
              ) : winner.model_path ? (
                <SimpleModelCanvas modelPath={winner.model_path} />
              ) : null}
            </div>

            {/* ── Item name ── */}
            <h3 className={styles.resultName}>{winner.name}</h3>

            {/* ── Description ── */}
            <p className={styles.resultDescription}>{winner.description}</p>

            {/* ── Price ── */}
            <p className={styles.resultPrice}>
              ${Number(winner.price).toFixed(2)}
            </p>

            {/* ── Action buttons ── */}
            <div className={styles.resultActions}>
              <button className={styles.viewBtn} onClick={handleViewItem}>
                View Item
              </button>
              <button className={styles.spinAgainBtn} onClick={handleSpinAgain}>
                Spin Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
