"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.scss";

// ---------- config ----------
const MIN_DISPLAY_TIME = 1500; // minimum time the screen stays, in ms
const DOT_INTERVAL = 400;      // how fast the dots cycle, in ms

export default function LoadingScreen() {
  // ---------- state ----------
  const [minTimePassed, setMinTimePassed] = useState(false); // has the minimum time elapsed?
  const [pageLoaded, setPageLoaded] = useState(false);        // has the window finished loading?
  const [isHidden, setIsHidden] = useState(false);            // should we remove the screen?
  const [dotCount, setDotCount] = useState(1);                // 1, 2, or 3 dots

  // ---------- minimum display timer ----------
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_DISPLAY_TIME);
    return () => clearTimeout(timer);
  }, []);

  // ---------- window load listener ----------
  useEffect(() => {
    // if the page already loaded before this ran, mark it straight away
    if (document.readyState === "complete") {
      setPageLoaded(true);
      return;
    }

    const onLoad = () => setPageLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // ---------- cycle the dots: 1 -> 2 -> 3 -> 1 ... ----------
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, DOT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // ---------- hide when both conditions are met ----------
  useEffect(() => {
    if (minTimePassed && pageLoaded) {
      setIsHidden(true);
    }
  }, [minTimePassed, pageLoaded]);

  // ---------- render ----------
  // once hidden, remove from the DOM completely
  if (isHidden) return null;

  return (
    <div className={styles.loadingScreen}>
      {/* ---------- burger ---------- */}
      <svg
        className={styles.burger}
        viewBox="0 0 200 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* top bun */}
        <g className={styles.topBun}>
          <path
            d="M 30 60 Q 30 20 100 20 Q 170 20 170 60 Z"
            fill="var(--white)"
            stroke="var(--black)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>

        {/* patty */}
        <g className={styles.patty}>
          <rect
            x="30"
            y="62"
            width="140"
            height="22"
            rx="10"
            fill="var(--white)"
            stroke="var(--black)"
            strokeWidth="5"
          />
        </g>

        {/* bottom bun (top bun shape, flipped vertically) */}
        <g className={styles.bottomBun}>
          <path
            d="M 30 86 Q 30 126 100 126 Q 170 126 170 86 Z"
            fill="var(--white)"
            stroke="var(--black)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* ---------- text ---------- */}
      <p className={styles.text}>
        Heating up the grill
        {/* dots cycle 1 -> 2 -> 3; fixed-width wrapper stops text from shifting */}
        <span className={styles.dots}>
          {".".repeat(dotCount)}
        </span>
      </p>
    </div>
  );
}