"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.scss";

// ---------- config ----------
const MIN_DISPLAY_TIME = 1500; // minimum time the screen stays, in ms

export default function LoadingScreen() {
  // ---------- state ----------
  const [minTimePassed, setMinTimePassed] = useState(false); // has the minimum time elapsed?
  const [pageLoaded, setPageLoaded] = useState(false);        // has the window finished loading?
  const [isHidden, setIsHidden] = useState(false);            // should we remove the screen?

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
      {/* placeholder content — burger + flames + joke come later */}
      <p className={styles.text}>Heating up the grill</p>
    </div>
  );
}