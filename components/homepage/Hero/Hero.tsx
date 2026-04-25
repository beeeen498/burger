"use client";

import { forwardRef } from "react";
import styles from "./Hero.module.scss";
import Header from "@/components/global/Header/Header";

const base = ["PICKLES", "SAUCE", "BEEF", "CHEESE", "ONIONS", "TOMATO", "LETTUCE"];
const marqueeText = base.map((_, i) =>
  [...base.slice(i), ...base.slice(0, i)].join(" • ")
);

// forwardRef so page.tsx can pass heroRef to ScrollTracker
const Hero = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className={styles.hero}>
      <div className={styles.heroContainer}>

        <Header />

        {/* Empty placeholder — the burger is rendered by BurgerCanvas above */}
        <div className={styles.burger} aria-hidden="true" />

        {/* crt overlay */}
        <div className={styles.crtOverlay} />

        {/* marquee */}
        <div className={styles.marqueeWrapper}>
          <div className={styles.carouselTrack}>
            {[...marqueeText, ...marqueeText].map((text, i) => (
              <div className={styles.text} key={i}>
                <h1>{text}</h1>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
});

Hero.displayName = "Hero";
export default Hero;