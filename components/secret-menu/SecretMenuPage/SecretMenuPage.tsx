"use client";

import MatrixRain from "../MatrixRain/MatrixRain";
import Header from "@/components/global/Header/Header";
import CountdownTimer from "../CountdownTimer/CountdownTimer"
import styles from "./SecretMenuPage.module.scss";

export default function SecretMenuPage() {
  return (
    <main className={styles.page}>
      {/* ── Matrix rain background ── */}
      <MatrixRain />

      <div className={styles.headerWrapper}>
        <Header />
      </div>
    
      {/* ── Page content — placeholder for now ── */}
      <div className={styles.content}>
        <h1 className={styles.title}>Secret Menu</h1>
        
        {/* ── Countdown timer ── */}
        <CountdownTimer />
      </div>
    </main>
  );
}
