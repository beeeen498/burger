"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoadingStore } from "@/store/useLoadingStore";
import styles from "./LoadingScreen.module.scss";

// ---------- config ----------
const MIN_DISPLAY_TIME = 1500; // minimum time on first page load, in ms
const MIN_NAV_TIME = 600; // minimum time on route changes, in ms
const DOT_INTERVAL = 400; // how fast the dots cycle, in ms

export default function LoadingScreen() {
  // ---------- state ----------
  const [minTimePassed, setMinTimePassed] = useState(false); // first-load minimum timer done?
  const [pageLoaded, setPageLoaded] = useState(false); // window 'load' event fired?
  const [isHidden, setIsHidden] = useState(false); // should we remove the screen?
  const [dotCount, setDotCount] = useState(1); // 1, 2, or 3 dots
  const [navMinTimePassed, setNavMinTimePassed] = useState(true); // min time passed for THIS navigation

  const pathname = usePathname();
  const isPageReady = useLoadingStore((state) => state.isPageReady); // shared "is the new page ready" flag
  const isFirstRender = useRef(true); // distinguishes first mount from real navigation

  // ---------- first-load: minimum display timer ----------
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_DISPLAY_TIME);
    return () => clearTimeout(timer);
  }, []);

  // ---------- first-load: window load listener ----------
  useEffect(() => {
    if (document.readyState === "complete") {
      setPageLoaded(true);
      return;
    }
    const onLoad = () => setPageLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // ---------- first-load: hide once both conditions are met ----------
  useEffect(() => {
    if (minTimePassed && pageLoaded) {
      setIsHidden(true);
    }
  }, [minTimePassed, pageLoaded]);

  // ---------- navigation: show again on every route change ----------
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsHidden(false); // show the screen for this navigation
    setNavMinTimePassed(false); // reset the minimum-time gate

    const timer = setTimeout(() => setNavMinTimePassed(true), MIN_NAV_TIME);
    return () => clearTimeout(timer);
  }, [pathname]);

  // ---------- navigation: hide once page is ready AND min time passed ----------
  useEffect(() => {
    if (isFirstRender.current) return; // nothing to hide yet on first mount
    if (isPageReady && navMinTimePassed) {
      setIsHidden(true);
    }
  }, [isPageReady, navMinTimePassed]);

  // ---------- cycle the dots: 1 -> 2 -> 3 -> 1 ... ----------
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, DOT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // ---------- render ----------
  if (isHidden) return null;

  return (
    <div className={styles.loadingScreen}>
      {/* ---------- burger wrapped in rotating ring ---------- */}
      <div className={styles.burgerWrapper}>
        {/* ---------- rotating ring (sits behind the burger) ---------- */}
        <div className={styles.ring} />

        {/* ---------- static burger ---------- */}
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
              y="66"
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
              d="M 30 94 Q 30 132 100 132 Q 170 132 170 94 Z"
              fill="var(--white)"
              stroke="var(--black)"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* ---------- text ---------- */}
      <p className={styles.text}>
        Heating up the grill
        {/* dots cycle 1 -> 2 -> 3; fixed-width wrapper stops text from shifting */}
        <span className={styles.dots}>{".".repeat(dotCount)}</span>
      </p>
    </div>
  );
}
