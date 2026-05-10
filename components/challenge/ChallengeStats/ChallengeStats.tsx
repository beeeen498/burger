'use client'

import { useEffect, useRef, useState } from "react";
import styles from "./ChallengeStats.module.scss";

interface StatCircleProps {
  value: number;
  suffix: string;
  label: string;
  started: boolean;
  colorClass: string;
}

const STATS = [
  { value: 2847, suffix: "+", label: "Failed Attempts" },
  { value: 10000,   suffix: "kg", label: "Total Weight Eaten" },
  { value: 20000, suffix: "", label: "Calories Per Burger" },
];

function useCountUp(target: number, duration = 2200, started = false) {
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

function StatCircle({ value, suffix, label, started, colorClass }: StatCircleProps) {
  const count = useCountUp(value, 2200, started);

  const display = count.toLocaleString();

  return (
    <div className={`${styles.circle} ${styles[colorClass]}`}>
      <span className={styles.value}>{display}{suffix}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

const ChallengeStats = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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