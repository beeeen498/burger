"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoadingStore } from "@/store/useLoadingStore";
import styles from "./LoadingScreen.module.scss";

// ---------- config ----------
const MIN_DISPLAY_TIME = 1500;
const MIN_NAV_TIME = 600;
const DOT_INTERVAL = 400;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [dotCount, setDotCount] = useState(1);

  const pathname = usePathname();
  const isPageReady = useLoadingStore((state) => state.isPageReady);

  // ── tracks whether first load has completed ──
  const firstLoadDone = useRef(false);
  const prevPathname = useRef(pathname);

  // ---------- first load: hide after min time ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      firstLoadDone.current = true;
    }, MIN_DISPLAY_TIME);

    return () => clearTimeout(timer);
  }, []);

  // ---------- route changes: show loading, then hide ----------
  useEffect(() => {
    if (!firstLoadDone.current) return;

    // ── Scroll to top on every route change ──
    window.scrollTo(0, 0);

    setVisible(true);

    // ── Only hide after min time AND page is ready ──
    const timer = setTimeout(() => {
      if (useLoadingStore.getState().isPageReady) {
        setVisible(false);
      }
    }, MIN_NAV_TIME);

    return () => clearTimeout(timer);
  }, [pathname]);

  // ---------- page ready after nav min time ----------
  useEffect(() => {
    if (!firstLoadDone.current) return;
    if (isPageReady) {
      setVisible(false);
    }
  }, [isPageReady]);

  // ---------- catch route change immediately (no flash) ----------
  if (firstLoadDone.current && pathname !== prevPathname.current) {
    prevPathname.current = pathname;
    if (!visible) {
      setVisible(true);
    }
  }

  // ---------- dots animation ----------
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, DOT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // ---------- block scroll while visible ----------
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.burgerWrapper}>
        <div className={styles.ring} />
        <svg
          className={styles.burger}
          viewBox="0 0 200 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className={styles.topBun}>
            <path
              d="M 30 60 Q 30 20 100 20 Q 170 20 170 60 Z"
              fill="var(--white)"
              stroke="var(--black)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </g>
          <g className={styles.patty}>
            <rect
              x="30"
              y="66"
              width="140"
              height="22"
              rx="10"
              fill="var(--white)"
              stroke="var(--black)"
              strokeWidth="5"
            />
          </g>
          <g className={styles.bottomBun}>
            <path
              d="M 30 94 Q 30 132 100 132 Q 170 132 170 94 Z"
              fill="var(--white)"
              stroke="var(--black)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      <p className={styles.text}>
        Heating up the grill
        <span className={styles.dots}>{".".repeat(dotCount)}</span>
      </p>
    </div>
  );
}
