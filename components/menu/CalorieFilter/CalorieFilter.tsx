"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MenuItem } from "../MenuPage/MenuPage";
import { FaWeightScale } from "react-icons/fa6";
import styles from "./CalorieFilter.module.scss";

// ── Props ──────────────────────────────────────────
interface CalorieFilterProps {
  items: MenuItem[];
  calorieRange: [number, number] | null;
  setCalorieRange: (range: [number, number] | null) => void;
}

// ── Step size for the slider ──
const STEP = 10;

export default function CalorieFilter({
  items,
  calorieRange,
  setCalorieRange,
}: CalorieFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ── Calculate min/max from actual menu data ──
  const { minCal, maxCal } = useMemo(() => {
    const allCalories = items
      .map((item) => item.calories)
      .filter((cal): cal is number => cal !== null);

    if (allCalories.length === 0) return { minCal: 0, maxCal: 2500 };

    return {
      minCal: Math.floor(Math.min(...allCalories) / STEP) * STEP,
      maxCal: Math.ceil(Math.max(...allCalories) / STEP) * STEP,
    };
  }, [items]);

  // ── Current slider values — fall back to full range ──
  const currentMin = calorieRange ? calorieRange[0] : minCal;
  const currentMax = calorieRange ? calorieRange[1] : maxCal;

  // ── Whether filter is actively narrowing results ──
  const isFilterActive = calorieRange !== null;

  // ── Handle min slider change ──
  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      const clampedMin = Math.min(value, currentMax - STEP);
      setCalorieRange([clampedMin, currentMax]);
    },
    [currentMax, setCalorieRange],
  );

  // ── Handle max slider change ──
  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      const clampedMax = Math.max(value, currentMin + STEP);
      setCalorieRange([currentMin, clampedMax]);
    },
    [currentMin, setCalorieRange],
  );

  // ── Reset filter ──
  const handleReset = () => {
    setCalorieRange(null);
  };

  // ── Close panel when clicking outside ──
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Calculate fill bar position as percentages ──
  const range = maxCal - minCal || 1;
  const leftPercent = ((currentMin - minCal) / range) * 100;
  const rightPercent = ((maxCal - currentMax) / range) * 100;

  return (
    <>
      {/* ── Floating button ── */}
      <button
        ref={buttonRef}
        className={`${styles.floatingBtn} ${isFilterActive ? styles.active : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Calorie filter"
      >
        <FaWeightScale size={25}/>

        {/* ── Active badge ── */}
        {isFilterActive && <span className={styles.badge} />}
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <div ref={panelRef} className={styles.panel}>
          {/* ── Panel header ── */}
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Calories</h3>
            {isFilterActive && (
              <button className={styles.resetBtn} onClick={handleReset}>
                Reset
              </button>
            )}
          </div>

          {/* ── Range display ── */}
          <p className={styles.rangeLabel}>
            {currentMin} — {currentMax} cal
          </p>

          {/* ── Dual range slider ── */}
          <div className={styles.sliderContainer}>
            {/* ── Track fill bar ── */}
            <div
              className={styles.sliderFill}
              style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
            />

            {/* ── Min handle ── */}
            <input
              type="range"
              min={minCal}
              max={maxCal}
              step={STEP}
              value={currentMin}
              onChange={handleMinChange}
              className={styles.slider}
              aria-label="Minimum calories"
            />

            {/* ── Max handle ── */}
            <input
              type="range"
              min={minCal}
              max={maxCal}
              step={STEP}
              value={currentMax}
              onChange={handleMaxChange}
              className={styles.slider}
              aria-label="Maximum calories"
            />
          </div>
        </div>
      )}
    </>
  );
}
