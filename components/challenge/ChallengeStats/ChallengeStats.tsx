'use client'

import { useEffect, useRef, useState } from "react";
import { useLoadingStore } from "@/store/useLoadingStore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ChallengeStats.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface StatCircleProps {
  value: number;
  suffix: string;
  label: string;
  started: boolean;
  colorClass: string;
}

const STATS = [
  { value: 2847, suffix: "+", label: "Failed Attempts" },
  { value: 10000, suffix: "kg", label: "Total Weight Eaten" },
  { value: 20000, suffix: "", label: "Calories Per Burger" },
];

// ─── Count-up hook — eases from 0 to target over duration ────────────────────
function useCountUp(target: number, duration = 3500, started = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);

  return count;
}

// ─── Individual stat circle ──────────────────────────────────────────────────
function StatCircle({ value, suffix, label, started, colorClass }: StatCircleProps) {
  const count = useCountUp(value, 3500, started);
  const display = count.toLocaleString();

  return (
    <div className={`${styles.circle} ${styles[colorClass]}`}>
      <span className={styles.value}>{display}{suffix}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

// ─── Stats row ───────────────────────────────────────────────────────────────
const ChallengeStats = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const isPageReady = useLoadingStore((s) => s.isPageReady);

  // ─── Count-up trigger — waits for page ready + in view ─────────────────────
  useEffect(() => {
    if (!isPageReady) return;

    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isPageReady]);

  // ─── GSAP slide-up — only on mobile/tablet (≤1000px) ──────────────────────
  useEffect(() => {
    if (!isPageReady) return;
    if (window.innerWidth > 1000) return;

    const el = statsRef.current;
    if (!el) return;

    gsap.set(el, { y: 60, opacity: 0 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        });
      },
    });

    return () => trigger.kill();
  }, [isPageReady]);

  return (
    <div className={styles.stats} ref={statsRef}>
      {STATS.map((s, i) => (
        <StatCircle
          key={s.label}
          value={s.value}
          suffix={s.suffix}
          label={s.label}
          started={started}
          colorClass={["yellow", "blue", "pink"][i]}
        />
      ))}
    </div>
  );
};

export default ChallengeStats;